import './App.css'
import { useState } from 'react'

const getApi = () => {
  if (typeof process !== 'undefined') {
    const { protocol, hostname } = window.location
    const { API_PORT } = process.env
    return `${protocol}//${hostname}:${API_PORT}`
  } else {
    return ''
  }
}

function App () {
  const [shuttingDown, setShuttingDown] = useState(false)

  return (
    <div className='App'>
      <button
        onClick={() => {
          setShuttingDown(true)
          fetch(`${getApi()}/api/shutdownNow`, {
            method: 'POST',
            credentials: 'include'
          })
        }}
      >
        {shuttingDown ? 'Shutting down...' : 'Shutdown now'}
      </button>
    </div>
  )
}

export default App
