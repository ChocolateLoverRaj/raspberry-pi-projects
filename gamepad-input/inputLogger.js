import joysticksEventEmitter from './joysticksEventEmitter.js'
import { config } from 'dotenv'
import parseEnvInt from './helpers/parseEnvInt.js'
config()

const readGamepadDelay = parseEnvInt('READ_GAMEPAD_DELAY')

joysticksEventEmitter(readGamepadDelay)
  .on('input', (gamepadNumber, { time, number, type, value, isInitial }) => {
    console.log(gamepadNumber, time, type, number, value, isInitial)
  })
  .on('connect', (gamepadNumber) => {
    console.log(gamepadNumber, 'connect')
  })
  .on('disconnect', gamepadNumber => {
    console.log(gamepadNumber, 'disconnect')
  })
