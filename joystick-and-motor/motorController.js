import { workerData, parentPort } from 'node:worker_threads'
import { writeSync } from 'fs'
import { config } from 'dotenv'
import { Gpio } from 'onoff'
import parseEnvJson from './parseEnvJson.js'
import Ajv from 'ajv'
import parseEnvFloat from './parseEnvFloat.js'
import { debuglog } from 'util'
import bigintMax from '@extra-bigint/max'
config()

const shouldLogSteps = debuglog('steps').enabled

const ajv = new Ajv()

const motorPins = parseEnvJson('MOTOR')
const validate = ajv.compile({
  type: 'array',
  items: {
    type: 'integer'
  },
  minItems: 4,
  maxItems: 4
})
if (!validate(motorPins)) {
  console.error(validate.errors)
  throw new Error('Invalid MOTORS env var')
}
const motor = motorPins.map(pin => new Gpio(pin, 'out'))
const shouldDoWhileLoop = new Uint8Array(workerData, 0, 1)
const joystickInput = new Int16Array(workerData, 8, 1)

const maxRpm = parseEnvFloat('MAX_RPM')
const stepsPerRevolution = parseEnvFloat('STEPS_PER_REVOLUTION')

// From
// eslint-disable-next-line max-len
// https://www.idc-online.com/technical_references/pdfs/electrical_engineering/Step_Sequence_of_Stepper_Motor.pdf
const steps = [
  [1, 0, 0, 1],
  [1, 1, 0, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1]
]

const getFraction = () => {
  const currentJoystickPos = joystickInput[0]
  const fraction = currentJoystickPos / (2 ** 15 - 1)
  return fraction
}

const getNsPerStep = fraction => fraction === 0
  ? undefined
  : (
      BigInt(Math.floor(
        // Minutes per revolution
        1 / (maxRpm * Math.abs(fraction)) /
        // Minutes per step
        stepsPerRevolution *
        // Nanoseconds per step
        60 * (10 ** 3) ** 3)))

parentPort.on('message', () => {
  let step = 0
  let lastAction = 0n
  writeSync(1, 'Starting while loop to control motor\n')
  while (shouldDoWhileLoop[0]) {
    const fraction = getFraction()
    let nanoSecondsPerStep = getNsPerStep(fraction)
    if (shouldLogSteps) {
      writeSync(1, `Step: ${step}. RPM fraction: ${fraction}. ns per step: ${nanoSecondsPerStep}\n`)
    }

    if (nanoSecondsPerStep !== undefined) {
      steps[step].forEach((on, index) => {
        motor[index].writeSync(on)
      })
      if (fraction > 0) {
        if (--step === -1) step = steps.length - 1
      } else {
        if (++step === steps.length) step = 0
      }
    }

    lastAction += process.hrtime.bigint()
    let now
    while (
      nanoSecondsPerStep === undefined ||
      (now = process.hrtime.bigint()) < lastAction + nanoSecondsPerStep
    ) {
      if (!shouldDoWhileLoop[0]) return
      const fraction = getFraction()
      nanoSecondsPerStep = getNsPerStep(fraction)
      if (fraction === 0) {
        motor.forEach(gpio => gpio.writeSync(0))
      }
      if (shouldLogSteps && fraction === 0) {
        writeSync(1, `Step: ${step}. Motor stopped. Move joystick to rotate motor\n`)
      }
    }
    lastAction = bigintMax((lastAction + nanoSecondsPerStep) - now, -1000n)
  }
})
