// Based on https://www.instructables.com/Super-Simple-Raspberry-Pi-433MHz-Home-Automation/
import parseEnvInt from 'parse-env-int'
import { config } from 'dotenv'
config()
import { Gpio } from 'onoff'

const receivePin = parseEnvInt('RECEIVE_PIN')


const receiveGpio = new Gpio(receivePin, 'in', 'both', { debounceTimeout: 10 })

let lastValue = receiveGpio.readSync()
let lt = Date.now()
receiveGpio.watch((err, value) => {
  if (err) throw err
  
  if (value !== lastValue || true) {
    const now = Date.now()
    // console.log(now - lt)
    lt = now
    process.stdout.write(value.toString())
  }
  lastValue = value
})
console.log(`Watching gpio pin: ${receivePin}`)

// setInterval(() => {
//   process.stdout.write('\n\n')
// }, 1000)
