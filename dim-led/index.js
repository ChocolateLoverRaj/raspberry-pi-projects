import { config } from 'dotenv'
config()
import Joystick from '@hkaspy/joystick-linux'
import { Gpio } from 'pigpio'
import parseEnvInt from './parseEnvInt.js'

const range = 40000
const led0 = new Gpio(parseEnvInt('LED_0_GPIO'), { mode: Gpio.OUTPUT })
led0.pwmRange(range)
const led1 = new Gpio(parseEnvInt('LED_1_GPIO'), { mode: Gpio.OUTPUT })
led1.pwmRange(range)

const joystick = new Joystick('/dev/input/js0', { includeInit: true })
  .on('update', ({ number, type, value }) => {
    const getPwmValue = value => Math.floor((value + 2 ** 15 - 1) / 2 ** 16 * range)

    if (type === 'AXIS') {
      if (number === 4) led0.pwmWrite(getPwmValue(value))
      else if (number === 5) led1.pwmWrite(getPwmValue(value))
    }
  })

process.on('SIGINT', () => {
  led0.digitalWrite(0)
  led1.digitalWrite(0)
  process.exit(0)
})
