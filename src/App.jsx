import { useEffect, useRef } from 'react'
import { initSocket } from './Socket.jsx'
import { MeasurePerformance } from './Performance.jsx'

function App() {

  const socketRef = useRef(null);
  initSocket(socketRef)

  return (
    <>
      <div>
        <MeasurePerformance />
      </div>
    </>
  )
}

export default App
