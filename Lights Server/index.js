import { Gpio } from 'onoff'
import express from 'express'
import { join } from 'path'
import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

const port = 8081
const lightPort = 18

const light = new Gpio(lightPort, 'out')

const app = express()

app.use(express.static(join(__dirname, './public')))

app.get('/api', (req, res) => {
	light.read()
		.then(result => {
			res.json(Boolean(result))
		})
		.catch(err => {
			res.status(500).end(err)
		})
})

app.put('/api', express.json({ strict: false }), (req, res) => {
	if (typeof req.body === 'boolean') {
		light.write(Number(req.body))
			.then(result => {
				res.end();
			})
			.catch(err => {
				res.status(500).end(err)
			})
	} else {
		res.status(400).end('JSON data must be boolean')
	}
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})

process.on('SIGINT', () => {
	console.log("Turning off light")
	light.write(0)
		.then(() => {
			console.log('Turned off light')
		})
		.catch(e => {
			console.error('Error turning off light', e)
		})
	process.exit()
})
