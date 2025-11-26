async function runPerformance(device, workgroupX, workgroupY, workgroupZ, dispatchX, dispatchY, dispatchZ, setDuration) {
    // 15625*64 = 1,000,000 (1M)
    let wgs = [workgroupX, workgroupY, workgroupZ];
    let dwg = [dispatchX, dispatchY, dispatchZ];
    let totalThreads = wgs[0] * wgs[1] * wgs[2] * dwg[0] * dwg[1] * dwg[2];
    if (totalThreads > 1000000) {
        totalThreads = (totalThreads / 1000000).toFixed(2) + "M";
    }

    console.log(`dispatchAmount ${dispatchX}, ${dispatchY}, ${dispatchZ} >> ${dispatchX * dispatchY * dispatchZ}M`);

    const startTime = Date.now(); // 현재 시각 (밀리초)
    const duration = setDuration * 1000;   // 1분 = 60초 = 60000ms

    let performanceArray = [];

    while (Date.now() - startTime < duration) {
        try {
            const time = await tempMaxShader(wgs[0], wgs[1], wgs[2], dwg[0], dwg[1], dwg[2]);
            if (time == null) {
                break;
            }

            let work = wgs[0] * wgs[1] * wgs[2] * dwg[0] * dwg[1] * dwg[2];
            let hashrate = (work / time).toFixed(0);
            performanceArray.push({ time: time, hashrate: hashrate });
        } catch (error) {
            console.log(
                `While Loop Broken\nError :${error}`
            )
            break;
        }
    }
    const res = await fetch("http://117.16.244.34:8083/save-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: performanceArray, filename: `${device}_${totalThreads}_threads` })
    });
    const response = await res.json();
    console.log(response);
}

export { runPerformance };