
import { runShader } from './shader.js';

async function runPerformance(device, workgroupX, workgroupY, workgroupZ, dispatchX, dispatchY, dispatchZ, setDuration, record) {
    // 15625*64 = 1,000,000 (1M)
    let wgs = [workgroupX, workgroupY, workgroupZ];
    let dwg = [dispatchX, dispatchY, dispatchZ];
    let totalThreads = wgs[0] * wgs[1] * wgs[2] * dwg[0] * dwg[1] * dwg[2];
    if (totalThreads > 1000000) {
        totalThreads = (totalThreads / 1000000).toFixed(2) + "M";
    }

    console.log(`dispatchAmount >> ${workgroupX * workgroupY * workgroupZ * dispatchX * dispatchY * dispatchZ}M`);

    const startTime = Date.now(); // 현재 시각 (밀리초)
    const duration = setDuration * 1000;   // 1분 = 60초 = 60000ms
    const shouldRecord = Boolean(record);

    let performanceArray = shouldRecord ? [] : null;

    while (Date.now() - startTime < duration) {
        try {
            const time = await runShader(wgs[0], wgs[1], wgs[2], dwg[0], dwg[1], dwg[2]);
            if (time == null) {
                console.log("Shader execution failed, exiting performance test.");
                break;
            }

            let work = wgs[0] * wgs[1] * wgs[2] * dwg[0] * dwg[1] * dwg[2];
            let hashrate = (work / time).toFixed(0);
            if (shouldRecord) {
                performanceArray.push({ time: time, hashrate: hashrate });
            }
        } catch (error) {
            console.log(
                `While Loop Broken\nError :${error}`
            )
            break;
        }
    }
    if (!shouldRecord) {
        return;
    }

    if (!performanceArray.length) {
        console.log("No performance data collected.");
        return;
    }

    const csvRows = ["time(ms),hashrate"];
    performanceArray.forEach(({ time, hashrate }) => {
        csvRows.push(`${time},${hashrate}`);
    });

    const csvBlob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const downloadName = `${totalThreads}_threads_${timestamp}.csv`;

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(csvBlob);
    downloadLink.download = downloadName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
}

export { runPerformance };
