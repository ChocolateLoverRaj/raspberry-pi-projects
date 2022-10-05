import './App.css'
import { useState } from 'react'

function App () {
  const [shuttingDown, setShuttingDown] = useState(false)

  return (
    <div className='App'>
      <button
        onClick={() => {
          setShuttingDown(true)
          const { protocol, hostname } = window.location
          const { API_PORT } = process.env
          fetch(`${protocol}//${hostname}:${API_PORT}/api/shutdownNow`, { method: 'POST' })
        }}
      >
        {shuttingDown ? 'Shutting down...' : 'Shutdown now'}
      </button>
    </div>
  )
}

export default App
