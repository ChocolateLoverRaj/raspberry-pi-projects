import getPort from 'get-port'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { createServer as createHttpsServer } from 'https'
import { readFile } from 'fs/promises'
import { once } from 'events'
import { exec } from 'child_process'
import passwordOptions from './passwordOptions.js'
import streamToString from 'stream-to-string'
import cors from 'cors'
import { networkInterfaces } from 'os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const execCommand = async (req, res, next, command) => {
  const authheader = req.headers.authorization

  if (!authheader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Enter raspberry pi login"')
    res.sendStatus(401)
    return false
  }

  const [username, password] = Buffer.from(authheader.split(' ')[1],
    'base64').toString().split(':')

  const childProcess = exec(`su - ${username} -c ${command}`)
  childProcess.stdin.end(password)
  const stderrPromise = streamToString(childProcess.stderr)
  const stdoutPromise = streamToString(childProcess.stdout)
  const [code] = await once(childProcess, 'close')
  if (code !== 0) {
    const stderr = await stderrPromise
    if (stderr.startsWith('su: ') || stderr.startsWith('Password: su: ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Invalid login"')
      res.sendStatus(401)
      return false
    } else {
      const stdout = await stdoutPromise
      next(new Error(
      `Error executing command: ${command}. Stderr: ${stderr}, Stdout: ${stdout}`))
      return false
    }
  }
  return true
}

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
    origin: (origin, callback) => callback(null, getOrigins())
  }), (req, res, next) => {
    if (getOrigins().includes(req.headers.origin)) {
      next()
    } else {
      res.sendStatus(403)
    }
  })

  app.post('/api/shutdownNow', async (req, res, next) => {
    if (await execCommand(req, res, next, '"sudo shutdown now"')) {
      res.end()
    }
  })

  createHttpsServer(httpsOptions, app).listen(apiPort, () => {
    console.log(`Api server is listening on port ${apiPort}`)
  })
}

export default createServer
