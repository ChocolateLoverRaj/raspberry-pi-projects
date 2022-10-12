import joysticksEventEmitter from './joysticksEventEmitter.js'
import { dirname } from 'dirname-filename-esm'
import { Worker } from 'node:worker_threads'
import { join } from 'path'
import { config } from 'dotenv'
import parseEnvFloat from './parseEnvFloat.js'
import parseEnvInt from './parseEnvInt.js'
config()

const readGamepadDelay = parseEnvInt('READ_GAMEPAD_DELAY')

const sharedArrayBuffer = new SharedArrayBuffer(8 + 16)
const startStopArray = new Uint8Array(sharedArrayBuffer, 0, 1)
const joystickAxisArray = new Int16Array(sharedArrayBuffer, 8, 1)

const worker = new Worker(join(dirname(import.meta), './motorController.js'), {
  workerData: sharedArrayBuffer
})
  .on('error', e => {
    throw e
  })
  .on('exit', e => {
    throw new Error(
      `Motor controller exited with code ${e}. Motor controller was not supposed to exit`)
  })

const startMotor = () => {
  startStopArray[0] = 1
  worker.postMessage(undefined)
}

const stopMotor = () => {
  console.log('Motor controller while loop stopped')
  startStopArray[0] = 0
}

const idleTimeout = parseEnvFloat('IDLE_TIMEOUT')
let stopTimeout

joysticksEventEmitter(readGamepadDelay)
  .on('input', (_joystickNumber, { number, type, value }) => {
    if (type === 'AXIS' && number === 1) {
      joystickAxisArray[0] = value
      if (value !== 0) {
        clearTimeout(stopTimeout)
        stopTimeout = undefined
        if (!startStopArray[0]) {
          startMotor()
        }
      } else if (stopTimeout === undefined && startStopArray[0]) {
        stopTimeout = setTimeout(stopMotor, idleTimeout)
      }
    }
  })

process.on('SIGINT', () => {
  process.exit(0)
})
