import reactObserver from 'observables/lib/reactObserver/reactObserver'
import useConstant from 'use-constant'
import createCharacteristicObservable from '../createCharacteristicObservable'
import GotCharacteristic from '../gotCharacteristic/GotCharacteristic'
import Props from './Props'

const RequestDeviceSuccess = reactObserver<Props>((observe, { device }) => {
  const characteristicObservable = useConstant(() => createCharacteristicObservable(device))
  const promiseData = observe(characteristicObservable)

  return (
    <>
      {promiseData !== undefined && promiseData.done
        ? promiseData.result.success
          ? <GotCharacteristic characteristic={promiseData.result.result} />
          : 'Error getting BLE characteristic'
        : 'Getting BLE characteristic...'}
    </>
  )
})

export default RequestDeviceSuccess
