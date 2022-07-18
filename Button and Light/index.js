import { Gpio } from 'onoff'

const button = new Gpio(25, 'in', 'both')
const light = new Gpio(18, 'out')

const watchHandler = (err, value) => {
	if (!err) {
		light.write(Number(!value)).catch(e => {
			console.error(e)
		})
	} else {
		console.error(err)
	}
}

button.watch(watchHandler)
button.read(watchHandler)

process.on('SIGINT', () => {
  light.unexport();
  button.unexport();
});
