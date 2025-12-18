import { runShader } from './shader.js';
import { hexStringToUint32Array } from "./util.js";


const header_template = '00000020a790cb4c5d8b0626334258f255e606ba5cdd6aab675102000000000000000000d291de09276913782ecb9e9ff8de2a274a6575915311699c61cf906b5ed19120ca14bf67';
const target = '0000008000000000000000000000000000000000000000000000000000000000';
const isTest = true;

async function runPerformance(workgroupX, workgroupY, workgroupZ, dispatchX, dispatchY, dispatchZ, setDuration, record) {

    var baseNum = 10000001;
    const headerControler = { num: 1 };

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        console.log("navigator.gpu.requestAdapter() failed... waiting for the adapter");
        return null;
    }
    const device = await adapter.requestDevice();
    if (device == undefined) {
        console.log("adapter.requestDevice() failed... waiting for the device");
        return null;
    }
    const targetArray = hexStringToUint32Array(target);

    // 15625*64 = 1,000,000 (1M)
    let wgs = [workgroupX, workgroupY, workgroupZ];
    let dwg = [dispatchX, dispatchY, dispatchZ];
    let totalThreads = wgs[0] * wgs[1] * wgs[2] * dwg[0] * dwg[1] * dwg[2];

    const iteration = Math.pow(2, 32) / (totalThreads);
    let itercount = 0;

    console.log(`dispatchAmount >> ${workgroupX * workgroupY * workgroupZ * dispatchX * dispatchY * dispatchZ}M`);

    const startTime = Date.now(); // 현재 시각 (밀리초)
    const duration = setDuration * 1000;   // 1분 = 60초 = 60000ms
    const shouldRecord = Boolean(record);

    const performanceArray = shouldRecord ? [] : null;
    console.log(`Header replacement period: ${iteration}`);
    const work = wgs[0] * wgs[1] * wgs[2] * dwg[0] * dwg[1] * dwg[2];
    while (Date.now() - startTime < duration) {
        if (itercount > iteration + 1) {
            headerControler.num++;
            itercount = 0;
        }
        const header = header_template + (baseNum + headerControler.num);
        const headerArray = hexStringToUint32Array(header);
        console.log(`${itercount}`)
        try {
            const res = await runShader(device, headerArray, targetArray, wgs[0], wgs[1], wgs[2], dwg[0], dwg[1], dwg[2], itercount, totalThreads, isTest);
            if (res == null) {
                console.log("Shader execution failed, exiting performance test.");
                break;
            }
            if (shouldRecord) {
                const hashrate = (work / res.time).toFixed(0);
                performanceArray.push({ time: res.time, hashrate: hashrate });
            }
        } catch (error) {
            console.log(
                `While Loop Broken\nError :${error}`
            )
            break;
        }
        itercount++;
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

    let millionThread;
    if (totalThreads > 1000000) {
        millionThread = (totalThreads / 1000000).toFixed(2) + "M";
    }
    const downloadName = `${millionThread}_threads_${timestamp}.csv`;

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(csvBlob);
    downloadLink.download = downloadName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
}

export { runPerformance };
