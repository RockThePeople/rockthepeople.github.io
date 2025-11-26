import { useEffect } from 'react'
import { io } from 'socket.io-client';
import { getPeerID } from './PeerID.jsx';

export function initSocket(socketRef) {

    let peerID = getPeerID();
    useEffect(() => {
        socketRef.current = io("http://117.16.244.34:8084", { query: { peerID } });
        const socket = socketRef.current;

        console.log(peerID);

        socket.on('message', async (res) => {
            switch (res.method) {
                case 'mining.notify':
                    jobParams = res.params;
                    // targetHash = jobParams[8]; // 이 줄 주석처리하면 테스트값
                    console.log(`JobParams Received { jobId : ${jobParams[0]} }`);
                    if (miningState[2]) {
                        await runWebGPU();
                    }
                    break;
                case 'mining.extraNonceAndDiff':
                    [extraNonce1, difficulty] = receiveNonceAndDiff(res);
                    console.log(`ExtraNonce1 : ${extraNonce1}`);
                    break;
                case 'mining.authorizationConfirm':
                    console.log("authorization confirmed");
                    authorizationFlag = true;
                    break;
                case 'submit.authError':
                    console.log(res.method);
                    break;
                case 'submit.noExtraNonce':
                    console.log(res.method);
                    break;
                case 'submit.responseResult':
                    if (res.result) {
                        console.log(`Submit Response : ${res.result}`);
                    } else {
                        console.log(`Submit Response : ${res.error[1]}`);
                    }
                    break;
                case 'mining.set_difficulty': break;
                default: break;
            }

            socket.on('difficultyUpdate', (msg) => {
                console.log(msg);
            })
        });

        return () => {
            socket.disconnect();
        };
    }, []);

}