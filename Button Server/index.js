import { Gpio } from 'onoff'
import express from 'express'
import { dirname } from 'dirname-filename-esm'
import { join } from 'path'
import expressWs from 'express-ws'

const __dirname = dirname(import.meta)

const port = 8080
const buttonPort = 25

const app = express()
expressWs(app)

app.use(express.static(join(__dirname, './public')))

const button = new Gpio(buttonPort, 'in', 'both')

app.ws('/', ws => {
    button.read()
	.then(value => {
	    ws.send(new Uint8Array([!value]), { binary: true })
	})
	.catch(e => {
	    console.error(e)
	})
    const watchHandler = (err, value) => {
        if (!err) {
	    ws.send(new Uint8Array([!value]), { binary: true })
        } else {
	    console.error(err)
        }
    }
    button.watch(watchHandler)
    ws.once('close', () => {
	button.unwatch(watchHandler)
    })
})

process.on('SIGINT', () => {
    button.unexport();
    process.exit()
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})
