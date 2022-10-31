import './App.css'
import ids from '../../ids.json'

function App() {
  return (
    <>
      <button
        onClick={async () => {
          await navigator.bluetooth.requestDevice({
            filters: [{
              services: [ids.serviceUuid]
            }]
          })
        }}
      >
        Connect to BLE peripheral
      </button>
    </>
  )
}

export default App
