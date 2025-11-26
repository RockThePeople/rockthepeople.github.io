import { useEffect, useRef } from 'react'
import initSocket from './Socket.jsx'
import { setupMiningHandlers } from './Mining.jsx'

function App() {

  const socketRef = useRef(null);
  initSocket(socketRef)

  // Register mining handlers once
  useEffect(() => {
    setupMiningHandlers()
  }, [])
  

  return (
    <>
      <div>
      
      </div>
    </>
  )
}

export default App
