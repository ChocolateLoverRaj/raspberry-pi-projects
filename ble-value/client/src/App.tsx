import './App.css'
import ids from '../../ids.json'
import reactObserver from 'observables/lib/reactObserver/reactObserver'
import useConstant from 'use-constant'
import ObservablePromise from 'observables/lib/observablePromise/ObservablePromise'
import create from 'observables/lib/observableValue/create'
import set from 'observables/lib/observableValue/set'
import createFromPromise from 'observables/lib/observablePromise/createFromPromise'
import RequestDeviceDone from './requestDeviceDone/RequestDeviceDone'

const App = reactObserver(observe => {
  const observableValue = useConstant(
    () => create<ObservablePromise<BluetoothDevice> | undefined>(undefined))
  const observablePromise = observe(observableValue.observable)
  const promiseData = observablePromise !== undefined ? observe(observablePromise) : undefined

  return (
    <>
      <button
        disabled={promiseData?.done === false}
        onClick={() => {
          set(observableValue, createFromPromise(navigator.bluetooth.requestDevice({
            filters: [{
              services: [ids.serviceUuid]
            }]
          })))
        }}
      >
        {promiseData?.done === false ? 'Connecting' : 'Connect'} to BLE peripheral
      </button>
      {promiseData?.done === true && (
        <>
          <br />
          <RequestDeviceDone result={promiseData.result} />
        </>)}
    </>
  )
})

export default App
