import { Transform } from 'node:stream'
import parseEvent from './parseEvent.js'

const createEventsParser = () => {
  return new Transform({
    transform: async chunk => parseEvent(chunk),
    objectMode: true
  })
}

export default createEventsParser
