import BlePeripheral from 'ble-peripheral'

const serviceName = 'com.sharedValue'
const serviceUuid = '44214494-baef-4519-889f-b45c07c68dfd'

const bp = new BlePeripheral(serviceName, serviceUuid, () => {
  bp.logCharacteristicsIO = true

  const sharedValue = bp.Characteristic(
    'b08f2d63-dd27-4e79-8371-3b3ff08ebbbb',
    'sharedValue',
    ['read', 'write', 'notify'])

  sharedValue.on('WriteValue', (device, arg1) => {
    sharedValue.setValue(arg1)
    sharedValue.notify()
  })
})
