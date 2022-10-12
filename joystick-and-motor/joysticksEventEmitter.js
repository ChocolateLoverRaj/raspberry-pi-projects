import { readdir, watch } from 'fs/promises'
import { join } from 'path'
import { scheduler } from 'timers/promises'
import { createReadStream } from 'fs'
import createEventsParser from './createEventsParser.js'
import chunker from 'stream-chunker'
import { EventEmitter } from 'events'

const inputsDir = '/dev/input'

const watching = new Set()

const getGamepadNumber = fileName => parseInt(fileName.slice(2))

const isGamepad = name => name.startsWith('js')

const joysticksEventEmitter = readGamepadDelay => {
  const eventEmitter = new EventEmitter()
  ;(async () => {
    const watchGamepad = gamepad => {
      const gamepadNumber = getGamepadNumber(gamepad)
      eventEmitter.emit('connect', gamepadNumber)
      watching.add(gamepadNumber)
      createReadStream(join(inputsDir, gamepad))
        .on('error', e => {
          if (e.code !== 'ENODEV') {
            eventEmitter.emit('error', e)
            return
          }
          watching.delete(gamepadNumber)
          eventEmitter.emit('disconnect', gamepadNumber)
        }).pipe(chunker(8)).pipe(createEventsParser())
        .on('data', data => {
          eventEmitter.emit('input', gamepadNumber, data)
        })
    }

    // Watch already connected gamepads
    const dirs = await readdir(inputsDir)
    dirs
      .filter(isGamepad)
      .forEach(name => watchGamepad(name))

    // Watch new gamepads
    for await (const { filename } of watch(inputsDir)) {
      if (isGamepad(filename) && !watching.has(getGamepadNumber(filename))) {
        // If the delay is very small or no delay, EACCESS could be thrown
        await scheduler.wait(readGamepadDelay)
        watchGamepad(filename)
      }
    }
  })()
  return eventEmitter
}

export default joysticksEventEmitter
