import { createServer } from 'http'

const server = createServer((req, res) => {
	res.end("Server will be doing some interesting and cool and fun stuff soon")
})

const port = 8080

server.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})
