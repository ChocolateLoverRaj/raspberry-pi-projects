import parseEnvInt from 'parse-env-int'
import { config } from 'dotenv'
config()
import { Gpio } from 'onoff'

const transmitPin = parseEnvInt('TRANSMIT_PIN')


const transmitGpio = new Gpio(transmitPin, 'out')

let lastValue = 1
setInterval(() => {
  // console.log(Number(!lastValue))
  transmitGpio.writeSync(Number(!lastValue))
  // transmitGpio.writeSync(1)
  lastValue = !lastValue
}, 100)
console.log(`Sending random 0s and 1s on pin: ${transmitPin}`)
