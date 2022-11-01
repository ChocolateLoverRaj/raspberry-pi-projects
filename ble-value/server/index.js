import BlePeripheral from 'ble-peripheral'
import ids from '../ids.json' assert { type: 'json' }

const serviceName = 'com.sharedValue'

const bp = new BlePeripheral(serviceName, ids.serviceUuid, () => {
  bp.logCharacteristicsIO = true

  const sharedValue = bp.Characteristic(
    ids.characteristicUuid,
    'sharedValue',
    ['read', 'write', 'notify'])

  sharedValue.on('WriteValue', (_device, arg1) => {
    sharedValue.setValue(arg1)
    sharedValue.notify()
  })
})
