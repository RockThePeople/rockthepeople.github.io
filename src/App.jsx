import { useEffect } from 'react';
import { Button } from './Button.jsx';
import { initSocket } from './InitSocket.jsx'
import { MeasurePerformance } from './Performance.jsx'
import { sendSocketMsg } from './SendSocketMsg.jsx';
import { handleMining } from './MiningHandler.jsx';

const wallet = 'bc1q4h5wttwul3mh8h8u7xp0vxqrezm68mc5utx039';
function App() {
  const socket = initSocket();
  useEffect(()=>{
    handleMining(socket);
  }, [socket])
  return (
    <>
      <div>
        <MeasurePerformance />
      </div>
      <Button clickEvent={() => sendSocketMsg(socket, `mining.authorize`, [wallet])} name={`Send Authorization`}></Button>
    </>
  )
}

export default App
