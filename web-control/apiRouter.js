import { Router } from 'express'
import { once } from 'events'
import { exec } from 'child_process'
import streamToString from 'stream-to-string'

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

const router = new Router()
router.post('/api/shutdownNow', async (req, res, next) => {
  if (await execCommand(req, res, next, '"sudo shutdown now"')) {
    res.end()
  }
})

export default router
