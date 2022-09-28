import { config } from 'dotenv'
import { Gpio } from 'onoff'
import parseEnvJson from './parseEnvJson.js'
import Ajv from 'ajv'
const ajv = new Ajv()
config()

const motorPortsArr = parseEnvJson('MOTORS')
const validate = ajv.compile({
  type: 'array',
  items: {
    type: 'array',
    items: {
      type: 'integer'
    },
    minItems: 4,
    maxItems: 4
  }
})

if (!validate(motorPortsArr)) {
  console.log(validate.errors)
  throw new Error('Invalid MOTORS env var')
}

const motors = motorPortsArr.map(ports => ports.map(port => new Gpio(port, 'out')))

// From
// eslint-disable-next-line max-len
// https://github.com/arduino-libraries/Stepper/blob/7e5e0974563d025fd23dfe35caa2d115d96554af/src/Stepper.cpp#L56-L62

const steps = [
  [1, 0, 0, 1],
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1]
]

/**
 * Rotations per minute
 */
const rpm = 15
const stepsPerRevolution = 2037.8864

const nanoSecondsPerStep = BigInt(Math.floor(
  // Minutes per revolution
  1 / rpm /
  // Minutes per step
  stepsPerRevolution *
  // Nanoseconds per step
  60 * (10 ** 3) ** 3))

let step = 0
while (true) {
  const stepStartTime = process.hrtime.bigint()
  steps[step].forEach((on, index) => {
    motors.forEach(motor => motor[index].writeSync(on))
  })
  if (++step === steps.length) step = 0
  while (process.hrtime.bigint() < stepStartTime + nanoSecondsPerStep);
}
