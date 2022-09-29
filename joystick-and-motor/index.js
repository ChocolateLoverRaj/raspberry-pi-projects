import Joystick from '@hkaspy/joystick-linux'
import { dirname } from 'dirname-filename-esm'
import { Worker } from 'node:worker_threads'
import { join } from 'path'

const sharedArrayBuffer = new SharedArrayBuffer(16)
const int16Array = new Int16Array(sharedArrayBuffer, 0, 1)

new Joystick('/dev/input/js0', { includeInit: true })
  .on('update', ({ number, type, value }) => {
    if (type === 'AXIS' && number === 1) {
      int16Array[0] = value
    }
  })

new Worker(join(dirname(import.meta), './motorController.js'), {
  workerData: sharedArrayBuffer
})
  .on('online', () => {
    console.log('Motor controller worker online')
  })
  .on('error', e => {
    throw e
  })
  .on('exit', e => {
    throw new Error(
      `Motor controller exited with code ${e}. Motor controller was not supposed to exit`)
  })

process.on('SIGINT', () => {
  process.exit(0)
})
