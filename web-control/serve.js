import getPort from 'get-port'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createHttpsServer } from 'https'
import passwordOptions from './passwordOptions.js'
import cors from 'cors'
import apiRouter from './apiRouter.js'
import readHttpsFiles from './readHttpsFiles.js'
import htmlPorts from './htmlPorts.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function serve ({ password }) {
  if (!passwordOptions.includes(password)) {
    throw new Error('Invalid password option')
  }
  if (password === 'never') {
    throw new Error('"never" password option not implemented yet')
  }
  const app = express()

  const [httpsOptions, port] = await Promise.all([
    readHttpsFiles(),
    getPort({ port: htmlPorts })
  ])

  app.use(cors(true))

  app.use(express.static('dist'))

  app.use(apiRouter)

  createHttpsServer(httpsOptions, app).listen(port, () => {
    console.log(`Server is listening on https://localhost:${port}`)
  })
}

export default serve
