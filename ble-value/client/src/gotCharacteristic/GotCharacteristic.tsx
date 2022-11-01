import { FC, useEffect } from 'react'
import useConstant from 'use-constant'
import Props from './Props'
import createPendingPromise from 'observables/lib/observablePromise/createPendingPromise'
import handlePromise from 'observables/lib/observablePromise/handlePromise'
import reactObserver from 'observables/lib/reactObserver/reactObserver'
import getObserve from 'observables/lib/observableValue/getObserve'
import ReadValue from '../readValue/ReadValue'

const GotCharacteristic = reactObserver<Props>((observe, { characteristic }) => {
  const observableValue = useConstant(() => createPendingPromise<string>())
  useEffect(() => {
    handlePromise(observableValue, (async () => {
      const dataView = await characteristic.readValue()
      const str = new TextDecoder().decode(dataView)
      return str
    })())
  }, [])
  const promiseData = observe(getObserve(observableValue))

  return (
    <>
      {promiseData.done
        ? promiseData.result.success
          ? <ReadValue characteristic={characteristic} initialValue={promiseData.result.result} />
          : 'Error reading value'
        : 'Reading value...'}
    </>
  )
})

export default GotCharacteristic
