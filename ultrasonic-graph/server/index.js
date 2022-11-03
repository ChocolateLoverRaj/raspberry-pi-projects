import BlePeripheral from 'ble-peripheral'
import ids from '../ids.json' assert { type: 'json' }
import parseEnvJsonSchema from 'parse-env-json-schema'
import { randomUUID } from 'crypto'
import { config } from 'dotenv'
import { Gpio } from 'pigpio'
import parseEnvInt from 'parse-env-int'
config()

// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
const MICROSECDONDS_PER_CM = 1e6 / 34321

const triggerInterval = parseEnvInt('TRIGGER_INTERVAL')

const serviceName = 'com.ultrasonicGraph'

const bp = new BlePeripheral(serviceName, ids.serviceUuid, () => {
  bp.logCharacteristicsIO = true

  const sensorsCharacteristic = bp.Characteristic(
    ids.characteristicUuid,
    'sensors',
    ['read'])
    
  const sensorPins = parseEnvJsonSchema('SENSORS', {
    type: 'array',
    items: {
      type: 'array',
      items: { type: 'integer' },
      minItems: 2,
      maxItems: 2
    }
  })

  const sensorUuids = sensorPins.map(() => randomUUID())
  
  sensorsCharacteristic.setValue(JSON.stringify({
    sensorUuids,
    triggerInterval
  }))

  const sensors = sensorPins.map(([triggerPin, echoPin]) => ({
    trigger: new Gpio(triggerPin, { mode: Gpio.OUTPUT }),
    echo: new Gpio(echoPin, { mode: Gpio.INPUT, alert: true })
  }))
  const subscribedDevices = new Array(sensorPins.length).fill(0)
  const watchingDataArr = []

  sensorPins.forEach((pins, index) => {
    const sensor = bp.Characteristic(
      sensorUuids[index],
      `sensor${index}`,
      ['notify']
    )

    sensor.on('StartNotify', () => {
      if (subscribedDevices[index]++ === 0) {
        sensors[index].trigger.digitalWrite(0)
        let startTick

        const alertHandler = (level, tick) => {
          if (level === 1) {
            startTick = tick
          } else {
            const endTick = tick
            const diff = (endTick >> 0) - (startTick >> 0) // Unsigned 32 bit arithmetic
            const distanceCm = diff / 2 / MICROSECDONDS_PER_CM
            sensor.notify(JSON.stringify({
              distance: distanceCm,
              time: Date.now() - watchingDataArr[index].startTime
            }))
          }
        }
        sensors[index].echo.on('alert', alertHandler)

        // FIXME: Bluetooth stops working with low intervals (<100)
        const interval = setInterval(() => {
          sensors[index].trigger.trigger(10, 1)
        }, triggerInterval)

        watchingDataArr[index] = { 
          alertHandler, 
          interval, 
          startTime: Date.now()
        }
      }
    })
    sensor.on('StopNotify', () => {
      if (--subscribedDevices[index] === 0) {
        console.log('Stop reading sensor:', index)
        const { interval, alertHandler } = watchingDataArr[index]
        sensors[index].echo.off('alert', alertHandler)
        clearInterval(interval)
      }
    })
  })
})
