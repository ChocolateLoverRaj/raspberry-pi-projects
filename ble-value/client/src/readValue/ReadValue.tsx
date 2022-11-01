import reactObserver from 'observables/lib/reactObserver/reactObserver'
import { useEffect, useState } from 'react'
import useConstant from 'use-constant'
import Props from './Props'
import createSetAsync from 'observables/lib/setAsync/create'
import set from 'observables/lib/setAsync/set/set'
import getSetPromise from 'observables/lib/setAsync/getSetPromise'

const ReadValue = reactObserver<Props>((observe, { characteristic, initialValue }) => {
  const [value, setValue] = useState(initialValue)

  const setAsync = useConstant(() => createSetAsync<undefined>())
  const promiseData = observe(getSetPromise(setAsync))

  useEffect(() => {
    const handler = (): void => {
      setValue(new TextDecoder().decode(characteristic.value))
    }
    characteristic.addEventListener('characteristicvaluechanged', handler)
    // FIXME: https://bugs.chromium.org/p/chromium/issues/detail?id=1380446
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      characteristic.startNotifications()
    }, 100)
    return () => {
      characteristic.removeEventListener('characteristicvaluechanged', handler)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      characteristic.stopNotifications()
    }
  }, [])

  return (
    <>
      {promiseData.done
        ? promiseData.result.success
          ? 'Changes saved'
          : 'Error saving changes'
        : 'Saving changes...'}
      <br />
      <input
        value={value}
        onChange={({ target: { value } }) => {
          setValue(value)
          set({
            setAsync,
            setFn: async () => {
              await characteristic.writeValue(new TextEncoder().encode(value))
            }
          })
        }}
      />
    </>
  )
})

export default ReadValue
