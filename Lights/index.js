import { Gpio } from 'onoff'

const light = new Gpio(18, 'out')

light.write(1)
	.then(() => {
		console.log("Turned on light")
		
		console.log("Press any key to exit")
		process.stdin.setRawMode(true)
		process.stdin.on('data', () => {
			process.exit()
		})
	})
	.catch(e => {
		console.error("Error turning on light", e)
	})

process.on('exit', () => {
	light.write(0)
		.then(() => {
			console.log("Turned off light")
		})
		.catch(e => {
			console.error("Error turning off light", e)
		})
		.finally(() => {
			light.unexport()
		})
})
