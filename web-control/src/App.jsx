import './App.css'
import { useState, useEffect } from 'react'

function App () {
  const [shuttingDown, setShuttingDown] = useState(false)

  return (
    <div className="App">
      <button
        onClick={() => {
          setShuttingDown(true)
            const promise = fetch('/api/shutdownNow', { method: 'POST' })
        }}
      >
        {shuttingDown ? 'Shutting down...' : 'Shutdown'}
      </button>
    </div>
  )
}

export default App
