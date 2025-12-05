import { Button } from './Button.jsx';
import { initSocket } from './InitSocket.jsx'
import { MeasurePerformance } from './Performance.jsx'
import { sendSocketMsg } from './SendSocketMsg.jsx';
import { useHandleSocketMsg } from './HandleSocketMsg.jsx';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { atomExtraNonce1, atomAuthFlag, atomSubscribeFlag, atomJobParams, atomDifficulty } from './atoms.jsx';

const wallet = 'bc1q4h5wttwul3mh8h8u7xp0vxqrezm68mc5utx039';
function App() {
  const socket = initSocket();
  const handlers = generateHandlers();
  useEffect(() => {
    useHandleSocketMsg(socket, { handlers });
  }, [socket])
  return (
    <>
      <div>
        <MeasurePerformance />
      </div>
      <Button clickEvent={() => sendSocketMsg(socket, `mining.authorize`, [wallet])} name={`Send Authorization`}></Button>
      <Button clickEvent={() => sendSocketMsg(socket, `mining.subscribe`)} name={`Send Subscription`}></Button>

    </>
  );
}

export default App;

function generateHandlers() {
  const setEN1 = useSetRecoilState(atomExtraNonce1);
  const setAuthFlag = useSetRecoilState(atomAuthFlag);
  const setSubscribeFlag = useSetRecoilState(atomSubscribeFlag);
  const setJobParams = useSetRecoilState(atomJobParams);
  const setDifficulty = useSetRecoilState(atomDifficulty);
  return { setEN1, setAuthFlag, setSubscribeFlag, setJobParams, setDifficulty };
}
