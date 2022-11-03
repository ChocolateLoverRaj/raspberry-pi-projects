import { serviceUuid, characteristicUuid } from '../../ids.json'
import never from 'never'
import Chart from 'chart.js/auto'
import autoColors from 'chartjs-plugin-autocolors'
Chart.register(autoColors)

const button = document.createElement('button')
button.innerText = 'requestDevice'
document.body.appendChild(button)

const errorP = document.createElement('p')
document.body.appendChild(errorP)

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d') ?? never()

const datasets: any[] = []
const chart = new Chart(ctx, {
  type: 'scatter',
  data: {
    datasets
  },
  options: {
    showLine: true,
    parsing: false,
    scales: {
      y: {
        title: {
          text: 'Distance (cm)',
          display: true
        },
        min: 0
      },
      x: {
        title: {
          text: 'Time (seconds)',
          display: true
        }
      }
    }
  }
})

document.body.appendChild(canvas)

button.addEventListener('click', () => {
  (async () => {
    errorP.innerText = ''
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
    const { sensorUuids } = JSON.parse(
      new TextDecoder().decode(await characteristic.readValue())) as {
      sensorUuids: string[]
      triggerInterval: number
    }

    console.log(sensorUuids)

    datasets.splice(0)
    await Promise.all(sensorUuids.map(async (uuid, index) => {
      const data: any[] = []
      datasets.push({
        label: `Sensor ${index}`,
        data
      })

      const characteristic = await service.getCharacteristic(uuid)
      const listener: EventListener = () => {
        const { distance, time } = JSON.parse(
          new TextDecoder().decode(characteristic.value ?? never())) as {
          distance: number
          time: number
        }
        data.push({
          x: time / 1000,
          y: distance
        })
        chart.update('none')
      }
      characteristic.addEventListener('characteristicvaluechanged', listener)
      await characteristic.startNotifications()
    }))
    chart.update()
  })().catch(e => {
    console.error(e)
    errorP.innerText = e.toString()
  })
})

export {}
