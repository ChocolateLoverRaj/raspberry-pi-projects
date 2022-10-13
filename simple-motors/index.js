import { config } from 'dotenv'
import parseEnvInt from 'parse-env-int'
import joysticksEventEmitter from 'joysticks'
import parseEnvJson from 'parse-env-json'
import { Gpio } from 'pigpio'
config()

const readGamepadDelay = parseEnvInt('READ_GAMEPAD_DELAY')
const motorsPorts = parseEnvJson('MOTORS_PORTS')

/** Max pwm range according to pigpio */
const pwmRange = 40000
const motors = motorsPorts.map(ports => ports.map(port => {
  const gpio = new Gpio(port, { mode: Gpio.OUTPUT })
  gpio.pwmRange(pwmRange)
  return gpio
}))

// For Xbox controller
const inputs = [
  // Left joystick up/down
  {
    type: 'AXIS',
    number: 1
  },
  // Right joystick up/down
  {
    type: 'AXIS',
    number: 4
  },
  // Plus pad up/down
  {
    type: 'AXIS',
    number: 7
  },
  // Y/A
  {
    type: 'BUTTON',
    numbers: [3, 0]
  },
  // Plus pad left/right
  {
    type: 'AXIS',
    number: 6
  },
  // X/B
  {
    type: 'BUTTON',
    numbers: [2, 1]
  }
]

const getMotorAndValue = ({ type, number, value }) => {
  if (type === 'AXIS') {
    const motorIndex = inputs.findIndex(
      ({ type: inputType, number: inputNumber }) => inputType === type && inputNumber === number)
    if (motorIndex === -1) return
    return {
      index: motorIndex,
      value: value / (2 ** 15 - 1)
    }
  } else {
    const motorIndex = inputs.findIndex(
      ({ type: inputType, numbers }) => inputType === type && numbers.includes(number))
    if (motorIndex === -1) return
    let calculatedValue
    // FIXME: Wierd things happen if both up and down buttons are pressed at a time
    if (value === 0) {
      calculatedValue = 0
    } else {
      const { numbers } = inputs[motorIndex]
      if (number === numbers[0]) {
        calculatedValue = -1
      } else {
        calculatedValue = 1
      }
    }
    return {
      index: motorIndex,
      value: calculatedValue
    }
  }
}

joysticksEventEmitter(readGamepadDelay).on('input', (_joystickNumber, event) => {
  const motorAndValue = getMotorAndValue(event)
  if (!motorAndValue) return
  const { index, value } = motorAndValue
  const motor = motors[index]
  if (value === 0) {
    motor.forEach(gpio => gpio.pwmWrite(0))
  } else {
    const pwmValue = Math.floor(Math.abs(value) * pwmRange)
    if (value > 0) {
      motor[0].pwmWrite(pwmValue)
      motor[1].pwmWrite(0)
    } else {
      motor[0].pwmWrite(0)
      motor[1].pwmWrite(pwmValue)
    }
  }
})

process.on('SIGINT', () => {
  motors.flat().forEach(gpio => gpio.digitalWrite(0))
  process.exit(0)
})
