// Based on https://github.com/fivdi/pigpio/blob/25d9446/example/distance-hc-sr04.js
import { Gpio } from 'pigpio'
import { config } from 'dotenv'
import parseEnvJson from 'parse-env-json'
import parseEnvInt from 'parse-env-int'
config()

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321

const gpios = parseEnvJson('GPIOS')
const sensors = gpios.map(([trigger, echo]) => ({
  trigger: new Gpio(trigger, { mode: Gpio.OUTPUT }),
  echo: new Gpio(echo, { mode: Gpio.INPUT, alert: true })
}))

// Make sure trigger is low
sensors.forEach(({ trigger, echo }, index) => {
  trigger.digitalWrite(0)
  let startTick

  echo.on('alert', (level, tick) => {
    if (level === 1) {
      startTick = tick
    } else {
      const endTick = tick
      const diff = (endTick >> 0) - (startTick >> 0) // Unsigned 32 bit arithmetic
      console.log(index, diff / 2 / MICROSECDONDS_PER_CM)
    }
  })
})

// Trigger a distance measurement once per second
setInterval(() => {
  // Set trigger high for 10 microseconds
  sensors.forEach(({ trigger }) => trigger.trigger(10, 1))
}, parseEnvInt('TRIGGER_INTERVAL'))
