import { useState, useEffect } from "react";
import { Button } from "./Button.jsx";
import { runShader } from "./shader.js";
import { saveInLocalStorage, getFromLocalStorage } from "./LocalStorageControl.jsx";

// const DISPATCH_START = 1;
// const DISPATCH_END = 1000;
// const WORKGROUP_X = 200;

const sleep = (delay) => new Promise(resolve => setTimeout(resolve, delay));

function averageMinusMax(values) {
    if (!values.length) return 0;
    return Math.min(...values);
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

    const handleStart = async () => {
        if (repeatCount < 1) return;
        console.log(`${startDispatchX}, ${endDispatchX}, ${stepSize}`);
        const results = [];
        for (let dispatchCount = startDispatchX; dispatchCount <= endDispatchX; dispatchCount=dispatchCount+stepSize) {
            const times = [];
            await sleep(100);
            for (let run = 0; run < repeatCount; run++) {
                const dep = await runShader(10, 1, 1, 1, 1, 1);
                const timeSeconds = await runShader(startWorkgroupX, 1, 1, dispatchCount, 1, 1);
                times.push(timeSeconds);
            }
            const avgSeconds = averageMinusMax(times);
            const totalThreads = startWorkgroupX * dispatchCount;
            const avgHashrate = avgSeconds > 0 ? (totalThreads / avgSeconds).toFixed(2) : "0";

            results.push({
                dispatchCount,
                totalThreads,
                avgSeconds: avgSeconds.toFixed(6),
                avgHashrate
            });
        }
        const adapter = await navigator.gpu.requestAdapter();
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
            <h3>Test Thread Range : {startWorkgroupX * startDispatchX} ➡️ {startWorkgroupX * endDispatchX} with Step {startWorkgroupX * stepSize}, Total Iter {endDispatchX / stepSize} * {repeatCount} </h3>
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
    const header = "dispatchCount,totalThreads,avgSeconds,avgHashrate";
    const csvRows = [header, ...rows.map(({ dispatchCount, totalThreads, avgSeconds, avgHashrate }) =>
        `${dispatchCount},${totalThreads},${avgSeconds},${avgHashrate}`
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
