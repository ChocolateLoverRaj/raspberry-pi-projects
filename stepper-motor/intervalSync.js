import { debuglog } from 'util'

const intervalLog = debuglog('interval')

/**
 * Calls the action **syncronously** every <inverval>ns (nanoseconds).
 * The action is called with a function that stops the loop.
 */
const intervalSync = (action, interval) => {
  let stopped = false
  let lastAction = 0n
  let lastLogged
  while (!stopped) {
    lastAction += process.hrtime.bigint()
    action(() => {
      stopped = true
    })
    let now
    while ((now = process.hrtime.bigint()) < lastAction + interval);
    lastAction = (lastAction + interval) - now
    if (intervalLog.enabled) {
      const second = now / BigInt(10e8)
      if (lastLogged !== second) {
        intervalLog(`+${-lastAction}ns interval timing error`)
        lastLogged = second
      }
    }
  }
}

export default intervalSync
