// Proper custom hook: register socket listeners inside useEffect and clean up on unmount.
export function useHandleSocketMsg(socket, { handlers }) {
    if (!socket) return;

    const messageHandler = async (res) => {
        switch (res.method) {
            case 'mining.notify':
                // store job params so other components can react
                handlers.setJobParams(res.params);
                console.log(`JobParams Received { jobId : ${res.params && res.params[0]} }`);
                break;
            case 'mining.extraNonceAndDiff':
                try {
                    handlers.setEN1(res.result[1]);
                    handlers.setDifficulty(res.result[0][0][1]);
                } catch (e) {
                    console.log((e)=>`Error parsing extraNonceAndDiff:${e}`, e);
                }
                // mark subscription as successful
                handlers.setSubscribeFlag(true);
                break;
            case 'mining.authorizationConfirm':
                console.log('authorization confirmed');
                handlers.setAuthFlag(true);
                break;
            case 'submit.authError':
            case 'submit.noExtraNonce':
                console.warn(res.method, res);
                break;
            case 'submit.responseResult':
                if (res.result) console.log('Submit Response :', res.result);
                else console.log('Submit Response :', res.error && res.error[1]);
                break;
            case 'mining.startInterval':
                console.log('Mining start interval received');
                break;
            default:
                break;
        }
    };

    const difficultyHandler = (msg) => {
        console.log('difficultyUpdate', msg);
        if (msg && msg.params) setDifficulty(msg.params[0]);
    }

    socket.on('message', messageHandler);
    socket.on('difficultyUpdate', difficultyHandler);

    return () => {
        socket.off && socket.off('message', messageHandler);
        socket.off && socket.off('difficultyUpdate', difficultyHandler);
    }
}