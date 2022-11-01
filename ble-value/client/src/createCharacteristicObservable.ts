import wrapGetObservable from 'observables/lib/wrapGetObservable/wrapGetObservable'
import get from 'observables/lib/observableValue/get'
import ObservablePromise from 'observables/lib/observablePromise/ObservablePromise'
import set from 'observables/lib/observableValue/set'
import never from 'never'
import ids from '../../ids.json'
import handlePromise from 'observables/lib/observablePromise/handlePromise'
import createPendingPromise from 'observables/lib/observablePromise/createPendingPromise'

const createCharacteristicObservable = (
  device: BluetoothDevice
): ObservablePromise<BluetoothRemoteGATTCharacteristic> => {
  const observableValue = createPendingPromise<BluetoothRemoteGATTCharacteristic>()
  const gatt = device.gatt ?? never()

  return wrapGetObservable({
    getValue: () => get(observableValue),
    getInternalObserve: triggerUpdate => {
      return {
        add: () => {
          observableValue.listeners.add(triggerUpdate)
          handlePromise(observableValue, (async () => {
            await gatt.connect()
            const service = await gatt.getPrimaryService(ids.serviceUuid)
            const characteristic = await service.getCharacteristic(ids.characteristicUuid)
            return characteristic
          })())
        },
        remove: () => {
          gatt.disconnect()
          set(observableValue, undefined)
        }
      }
    }
  })
}

export default createCharacteristicObservable
