import getPort from 'get-port'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { createServer as createHttpsServer } from 'https'
import { readFile } from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer () {
  const app = express()

  const [vite, port, key, cert] = await Promise.all([
    createViteServer({
      server: { middlewareMode: true }
    }),
    getPort({ port: [80, 3456] }),
    readFile('server.key'),
    readFile('server.cert')
  ])

  app.use((req, res, next) => {
    if (req.secure) return next()
    res.status(400).end('HTTPS must be used')
  })

  app.get('/api', async (req, res) => {
    res.send(`API response at ${Date.now()}`)
  })

  app.use(vite.middlewares)

  createHttpsServer({
    key,
    cert
  }, app).listen(port, () => {
    console.log(`Server is listening on port ${port}`)
  })
}

export default createServer
