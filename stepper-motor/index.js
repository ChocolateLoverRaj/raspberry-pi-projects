import { config } from 'dotenv'
import { Gpio } from 'onoff'
import parseEnvJson from './parseEnvJson.js'
import Ajv from 'ajv'
import intervalSync from './intervalSync.js'
import { debuglog } from 'util'
import parseEnvFloat from './parseEnvFloat.js'
const ajv = new Ajv()
config()

const revLog = debuglog('rev')

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
// https://www.idc-online.com/technical_references/pdfs/electrical_engineering/Step_Sequence_of_Stepper_Motor.pdf
const steps = [
  [1, 0, 0, 1],
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1]
]

/**
 * Rotations per minute
 */
const rpm = parseEnvFloat('RPM')
const stepsPerRevolution = parseEnvFloat('STEPS_PER_REVOLUTION')

const nanoSecondsPerStep = BigInt(Math.floor(
  // Minutes per revolution
  1 / rpm /
  // Minutes per step
  stepsPerRevolution *
  // Nanoseconds per step
  60 * (10 ** 3) ** 3))

let step = 0
let revSteps = 0
intervalSync(() => {
  steps[step].forEach((on, index) => {
    motors.forEach(motor => motor[index].writeSync(on))
  })
  if (++step === steps.length) step = 0
  if (revLog.enabled) {
    if (!Math.floor(++revSteps % stepsPerRevolution)) {
      revLog('Did revolutions:', revSteps / stepsPerRevolution)
    }
  }
}, nanoSecondsPerStep)
