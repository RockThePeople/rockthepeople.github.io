import { useState, useEffect } from "react";
import { Button } from "./Button.jsx";
import { runShader } from "./shader.js";
import { saveInLocalStorage, getFromLocalStorage } from "./LocalStorageControl.jsx";
import { hexStringToUint32Array } from "./util.js";

const header = '00000020a790cb4c5d8b0626334258f255e606ba5cdd6aab675102000000000000000000d291de09276913782ecb9e9ff8de2a274a6575915311699c61cf906b5ed19120ca14bf67ba125015';
const target = '0000008000000000000000000000000000000000000000000000000000000000';

// const DISPATCH_START = 1;
// const DISPATCH_END = 1000;
// const WORKGROUP_X = 200;

const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay));

function averageMinusMax(values) {
    if (!values.length) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    // const max = Math.max(...values);
    // const min = Math.min(...values);
    return sum / values.length;
    // return values.length > 2 ? (sum - max) / (values.length - 1) : sum / values.length;
}

export function AutoRunShader() {

    const savedStartWorkgroupX = Number(getFromLocalStorage("savedStartWorkgroupX")) || 1;
    const [startWorkgroupX, setStartWorkgroupX] = useState(savedStartWorkgroupX);
    function handleStartWorkgroupX(value) {
        const numericValue = Number(value);
        setStartWorkgroupX(numericValue);
        saveInLocalStorage("savedStartWorkgroupX", numericValue);
    }

    const savedStartDispatchX = Number(getFromLocalStorage("savedStartDispatchX")) || 1;
    const [startDispatchX, setStartDispatchX] = useState(savedStartDispatchX);
    function handleStartDispatchX(value) {
        const numericValue = Number(value);
        setStartDispatchX(numericValue);
        saveInLocalStorage("savedStartDispatchX", numericValue);
    }

    const savedEndDispatchX = Number(getFromLocalStorage("savedEndDispatchX")) || 1;
    const [endDispatchX, setEndDispatchX] = useState(savedEndDispatchX);
    function handleEndDispatchX(value) {
        const numericValue = Number(value);
        setEndDispatchX(numericValue);
        saveInLocalStorage("savedEndDispatchX", numericValue);
    }

    const savedStepSize = Number(getFromLocalStorage("savedStepSize")) || 1;
    const [stepSize, setStepSize] = useState(savedStepSize);
    function handleStepSize(value) {
        const numericValue = Number(value);
        setStepSize(numericValue);
        saveInLocalStorage("savedStepSize", numericValue);
    }

    useEffect(() => {
        handleStartDispatchX(stepSize);
    }, [stepSize])
    
    const [repeatCount, setRepeatCount] = useState(3);

    const targetArray = hexStringToUint32Array(target);
    const headerArray = hexStringToUint32Array(header);
    const handleStart = async () => {
        if (repeatCount < 1) return;
        console.log(`${startDispatchX}, ${endDispatchX}, ${stepSize}`);
        const results = [];
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
        // for (let dispatchCount = startDispatchX; dispatchCount <= endDispatchX; dispatchCount = dispatchCount + stepSize) {
        for (let dispatchCount = endDispatchX; dispatchCount >= startDispatchX; dispatchCount = dispatchCount - stepSize) {
            const times = [];
            await sleep(100);
            await runShader(device, headerArray, targetArray, startWorkgroupX, 1, 1, dispatchCount, 1, 1, 1, 1, true);
            for (let run = 0; run < repeatCount; run++) {
                const res = await runShader(device, headerArray, targetArray, startWorkgroupX, 1, 1, dispatchCount, 1, 1, 1, 1, true);
                times.push(res.time);
            }
            const avgSeconds = averageMinusMax(times);
            const totalThreads = startWorkgroupX * dispatchCount;
            const avgHashrate = avgSeconds > 0 ? (totalThreads / avgSeconds).toFixed(8) : "0";
            console.log(`Invoke Thread: ${totalThreads}, Times: ${times.map(t => t.toFixed(8)).join(", ")}`);
            
            results.push({
                totalThreads,
                avgSeconds: avgSeconds.toFixed(6),
                avgHashrate
            });
        }
        downloadCsv(results, adapter.info.description);
        console.log("Finished and downloaded CSV");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "50px", marginTop: "20px", backgroundColor: "#bdcfdfff" }}>
            <h3 style={{ margin: 0 }}>Auto Run Shader</h3>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", fontSize: "20px", margin: "-20px 0px" }}>
                <p> Start wgs_x :</p>
                <input type="number" placeholder="(wgs, 1, 1)" value={startWorkgroupX} onChange={(e) => handleStartWorkgroupX(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                <p> Start dwg_x  : </p>
                <input type="number" placeholder="(dwg, 1, 1)" value={startDispatchX} onChange={(e) => handleStartDispatchX(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", fontSize: "20px", margin: "-20px 0px", }}>
                <p> End wgs_x(Dont touch) : </p>
                <input type="number" placeholder="" value={startWorkgroupX} onChange={(e) => handleStartWorkgroupX(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                <p> End dwg_x  : </p>
                <input type="number" placeholder="" value={endDispatchX} onChange={(e) => handleEndDispatchX(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", fontSize: "20px", margin: "-20px 0px", }}>
                <p> Step Size : </p>
                <input type="number" placeholder="" value={stepSize} onChange={(e) => handleStepSize(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
            </div>
            <h3>Test Set Range : [{startWorkgroupX}, 1, 1]&[{startDispatchX}, 1, 1] ➡️ [{startWorkgroupX}, 1, 1]&[{endDispatchX}, 1, 1]</h3>
            <h3>Test Thread Range : {startWorkgroupX * startDispatchX} ➡️ {startWorkgroupX * endDispatchX} with Step {startWorkgroupX * stepSize}, Total Iter {(endDispatchX-startDispatchX) / stepSize} * {repeatCount} </h3>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                Repeat runs per dispatch (3-10 recommended):
                <input
                    type="number"
                    min="1"
                    max="20"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                    style={{ width: "80px" }}
                />
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Button name="Start Auto Run" clickEvent={handleStart} />
            </div>
        </div>
    );
}

async function downloadCsv(rows, device) {
    if (!rows.length) return;
    const header = "totalThreads,avgSeconds,avgHashrate";
    const csvRows = [header, ...rows.map(({totalThreads, avgSeconds, avgHashrate }) =>
        `${totalThreads},${avgSeconds},${avgHashrate}`
    )];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const downloadName = `${device}_${timestamp}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
