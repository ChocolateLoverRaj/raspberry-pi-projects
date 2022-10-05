import { readFile } from 'fs/promises'

const readHttpsFiles = async () => {
  const [cert, key] = await Promise.all([
    readFile('server.cert'),
    readFile('server.key')
  ])
  return { cert, key }
}

export default readHttpsFiles
