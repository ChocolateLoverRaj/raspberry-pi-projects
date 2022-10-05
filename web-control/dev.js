import getPort from 'get-port'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { createServer as createHttpsServer } from 'https'
import { readFile } from 'fs/promises'
import passwordOptions from './passwordOptions.js'
import cors from 'cors'
import { networkInterfaces } from 'os'
import apiRouter from './apiRouter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer ({ password }) {
  if (!passwordOptions.includes(password)) {
    throw new Error('Invalid password option')
  }
  if (password === 'never') {
    throw new Error('"never" password option not implemented yet')
  }
  const app = express()

  const [vitePort, key, cert, apiPort] = await Promise.all([
    getPort({ port: [80, 3456] }),
    readFile('server.key'),
    readFile('server.cert'),
    getPort({ port: [9191, 8282, 7373] })
  ])
  const httpsOptions = { key, cert }

  const viteServer = await createViteServer({
    server: {

      https: httpsOptions,
      port: vitePort,
      strictPort: true,
      host: true
    },
    define: {
      'process.env.API_PORT': JSON.stringify(apiPort)
    }

  })
  await viteServer.listen()
  viteServer.printUrls()

  const getOrigins = () => [
    ...Object.values(networkInterfaces()).flat().map(({ address }) => address),
    'localhost'
  ].map(address => `https://${address}:${vitePort}`)
  app.use(cors({
    origin: (origin, callback) => callback(null, getOrigins()),
    credentials: true
  }), (req, res, next) => {
    if (getOrigins().includes(req.headers.origin)) {
      next()
    } else {
      res.sendStatus(403)
    }
  })

  app.use(apiRouter)

  createHttpsServer(httpsOptions, app).listen(apiPort, () => {
    console.log(`Api server is listening on port ${apiPort}`)
  })
}

export default createServer
