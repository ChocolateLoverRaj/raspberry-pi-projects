// Based on https://github.com/fivdi/mcp-spi-adc/blob/b0c721e/example/tmp36.js
import mcp from 'mcp-spi-adc'

const voltageSensor = mcp.openMcp3008(0, err => {
  if (err) throw err

  setInterval(() => {
    voltageSensor.read((err, reading) => {
      if (err) throw err

      // Multiply by 3.3 because we are connecting RPI to MCP3008 using 3.3V pin
      // Multiply by 5 because in my setup I am using a voltage divider which divides by 5
      console.log(reading.value * 3.3 * 5)
    })
  }, 1000)
})
