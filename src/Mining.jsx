import { getnTime } from "./util";

export async function startMining(params) {
    if (!subscriptionFlag || !authorizationFlag || deviceOption === 'none' || peerId.length !== 16) {
        alert(`Authorization, Subscription, Set deviceOption First! or PeerId is not valid`);
        return;
    }
    params.extraNonce2 = new ExtraNonce2(peerId);
    var dispatch = getDispatch(deviceOption);
    console.log(`Thread Call : \n\tworkgroup_size : [64, 1, 1]\n\tdispatchWorkgroups : [${dispatch[0]}, ${dispatch[1]}, 1]`);
    disableMiningState();

    console.log(`⛏️🪙 Start Mining (Big Epoch) `);

    const bigEpochStart = performance.now();
    for (let j = 0; j < 10; j++) {
        var nTime = getnTime();
        console.log(`⛏️🪙 Little Epoch Start, extraNonce2 : ${extraNonce2.current()}`)
        header = await generateHeaderTemplate(jobParams, extraNonce1, extraNonce2.current(), nTime);
        console.log(`⛏️🪙 Header To Mine : ${header}`);

        const iter = Math.floor(Math.pow(2, 32) / (64 * dispatch[0] * dispatch[1]));

        var miningResult = await mining(header, targetHash, iter, dispatch, bigEpochStart, j);
        if (miningResult == 'bigEpochFinish') {
            console.log("Promised work time done.");
            return;
        }
        if (Number(miningResult) > 0) {
            answerNonce = reverseStringLikeBuffer(miningResult);
            console.log(`✅ Done! Result : \n\tNonce : ${miningResult}\n\tHeader : ${header}`);
            sendSubmit(nTime, answerNonce, extraNonce2.current());
        }
        extraNonce2.increment();
    }
}

function getDispatch(deviceOption) {
    if (deviceOption === 'opt') {
        return JSON.parse(localStorage.getItem('dispatch'));
    } else {
        return dispatchOptions[deviceOption];
    }
}