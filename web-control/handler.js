import express from 'express'

const app = express()

app.get('/api', (req, res) => {
  res.send(`API response at ${Date.now()}`)
})

export default app
