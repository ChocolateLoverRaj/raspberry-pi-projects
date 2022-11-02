import { serviceUuid, characteristicUuid } from '../../ids.json'
import never from 'never'
import Chart from 'chart.js/auto'

const button = document.createElement('button')
button.innerText = 'requestDevice'
document.body.appendChild(button)

const errorP = document.createElement('p')
document.body.appendChild(errorP)

button.addEventListener('click', () => {
  (async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: [serviceUuid]
      }]
    })
    console.log(device)
    const gatt = device.gatt ?? never()

    await gatt.connect()
    const service = await gatt.getPrimaryService(serviceUuid)
    console.log(service)
    const characteristic = await service.getCharacteristic(characteristicUuid)
    console.log(characteristic)
    const sensorUuids = JSON.parse(
      new TextDecoder().decode(await characteristic.readValue())) as string[]

    console.log(sensorUuids)

    sensorUuids.forEach(() => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d') ?? never()
      const labels = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June'
      ]

      const data = {
        labels,
        datasets: [{
          label: 'My First dataset',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [0, 10, 5, 2, 20, 30, 45]
        }]
      }

      const config = {
        type: 'line',
        data,
        options: {}
      }
      const myChart = new Chart(ctx, config)
      document.body.appendChild(canvas)
    })
  })().catch(e => {
    console.error(e)
    errorP.innerText = e.toString()
  })
})

export {}
