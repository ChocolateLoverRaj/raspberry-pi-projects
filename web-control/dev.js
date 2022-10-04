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

  app.post('/api/shutdownNow', async (req, res, next) => {
    if (await execCommand(req, res, next, '"sudo shutdown now"')) {
      res.end()
    }
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
