import BlePeripheral from 'ble-peripheral'
import ids from '../ids.json' assert { type: 'json' }
import parseEnvJsonSchema from 'parse-env-json-schema'
import { randomUUID } from 'crypto'
import { config } from 'dotenv'
config()

const serviceName = 'com.ultrasonicGraph'

const bp = new BlePeripheral(serviceName, ids.serviceUuid, () => {
  bp.logCharacteristicsIO = true

  const sensors = bp.Characteristic(
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
  
  sensors.setValue(JSON.stringify(sensorUuids))

  sensorPins.forEach((pins, index) => {
    const sensor = bp.Characteristic(
      sensorUuids[index],
      `sensor${index}`,
      ['notify']
    )

    sensor.on('StartNotify', () => {
      console.log('Start reading sensor:', index)
    })
    sensor.on('StopNotify', () => {
      console.log('Stop reading sensor:', index)
    })
  })
})
