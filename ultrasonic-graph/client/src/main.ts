const button = document.createElement('button')
button.innerText = 'requestDevice'
document.body.appendChild(button)

const cpuTempP = document.createElement('p')
document.body.appendChild(cpuTempP)

button.addEventListener('click', async () => {
  try {
    const serviceId = 'f04932f9-a746-4099-b274-e63ac3079db3'
    const cpuTempCharacteristic = '00000006-94f3-4011-be53-6ac36bf22cf1'
    const device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: [serviceId]
      }]
    })
    console.log(device)
    await device.gatt.connect()
    const service = await device.gatt.getPrimaryService(serviceId)
    console.log(service)
    const characteristic = await service.getCharacteristic(cpuTempCharacteristic)
    console.log(characteristic)
    const updateCpuTempUi = () => {
      const cpuTempDataView = characteristic.value
      console.log(cpuTempDataView)
      const cpuTempStr = new TextDecoder().decode(cpuTempDataView)
      console.log(cpuTempStr)
      cpuTempP.innerText = `Raspberry Pi CPU Temp: ${cpuTempStr}`
    }
    characteristic.addEventListener('characteristicvaluechanged', updateCpuTempUi)
    await characteristic.readValue()
    await characteristic.startNotifications()
  } catch (e) {
    console.error(e)
    cpuTempP.innerText = e.toString()
  }
})
