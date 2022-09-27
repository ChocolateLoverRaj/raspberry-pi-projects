import { config } from 'dotenv'
import { Gpio } from 'onoff'
import parseEnvInt from './parseEnvInt.js'
config()

const inputs = []
for (let i = 1; i <= 4; i++) {
  const gpio = parseEnvInt(`INPUT_${i}_GPIO`)
  inputs.push(new Gpio(gpio, 'out'))
}

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
  steps[step].forEach((on, index) => {
    // console.log(step, index, on)
    inputs[index].writeSync(on)
  })
  if (++step === steps.length) step = 0
  let lastTime = process.hrtime.bigint()
  let now
  while ((now = process.hrtime.bigint()) < lastTime + nanoSecondsPerStep);
  lastTime = now
}
