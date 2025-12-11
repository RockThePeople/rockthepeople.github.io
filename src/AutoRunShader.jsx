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
    if (values.length === 1) return values[0];
    const max = Math.max(...values);
    const sum = values.reduce((total, v) => total + v, 0);
    return (sum - max) / (values.length - 1);
}

export function AutoRunShader() {

    const savedStartWorkgroupX = getFromLocalStorage("savedStartWorkgroupX");
    const [startWorkgroupX, setStartWorkgroupX] = useState(savedStartWorkgroupX);
    function handleStartWorkgroupX(value) { setStartWorkgroupX(value); saveInLocalStorage("savedStartWorkgroupX", value); }

    const savedStartDispatchX = getFromLocalStorage("savedStartDispatchX");
    const [startDispatchX, setStartDispatchX] = useState(savedStartDispatchX);
    function handleStartDispatchX(value) { setStartDispatchX(value); saveInLocalStorage("savedStartDispatchX", value); }

    const savedEndDispatchX = getFromLocalStorage("savedEndDispatchX");
    const [endDispatchX, setEndDispatchX] = useState(savedEndDispatchX);
    function handleEndDispatchX(value) { setEndDispatchX(value); saveInLocalStorage("savedEndDispatchX", value); }

     const [startThreadCount, setStartThreadCount] = useState(1);
        useEffect(() => {
            setStartThreadCount((startWorkgroupX * startDispatchX).toLocaleString());
        }, [startWorkgroupX, startDispatchX])

    const [repeatCount, setRepeatCount] = useState(3);

    const handleStart = async () => {
        if (repeatCount < 1) return;
        const results = [];
        for (let dispatchCount = startDispatchX; dispatchCount <= endDispatchX; dispatchCount++) {
            const times = [];
            await sleep(500);
            await runShader(10, 1, 1, 1, 1, 1);
            for (let run = 0; run < repeatCount; run++) {
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

        downloadCsv(results);
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
            <h3>Test Range : [{startWorkgroupX}, 1, 1]&[{startDispatchX}, 1, 1] ➡️ [{startWorkgroupX}, 1, 1]&[{endDispatchX}, 1, 1]</h3>
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

function downloadCsv(rows) {
    if (!rows.length) return;
    const header = "dispatchCount,totalThreads,avgSeconds,avgHashrate";
    const csvRows = [header, ...rows.map(({ dispatchCount, totalThreads, avgSeconds, avgHashrate }) =>
        `${dispatchCount},${totalThreads},${avgSeconds},${avgHashrate}`
    )];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const downloadName = `auto_run_shader_4-to-10000_${timestamp}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}
