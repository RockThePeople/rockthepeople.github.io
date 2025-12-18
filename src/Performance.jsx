import { useState, useEffect } from "react";
import { Button } from "./Button.jsx";
import { runPerformance } from "./RunPerformance.jsx";
import { saveInLocalStorage, getFromLocalStorage } from "./LocalStorageControl.jsx";

export const MeasurePerformance = () => {

    const [filename, setFilename] = useState("");

    const savedWorkgroupX = getFromLocalStorage("workgroupX");
    const savedWorkgroupY = getFromLocalStorage("workgroupY");
    const savedWorkgroupZ = getFromLocalStorage("workgroupZ");
    const [workgroupX, setworkgroupX] = useState(savedWorkgroupX);
    const [workgroupY, setworkgroupY] = useState(savedWorkgroupY);
    const [workgroupZ, setworkgroupZ] = useState(savedWorkgroupZ);
    function handleworkgroupX(value) { setworkgroupX(value); saveInLocalStorage("workgroupX", value); }
    function handleworkgroupY(value) { setworkgroupY(value); saveInLocalStorage("workgroupY", value); }
    function handleworkgroupZ(value) { setworkgroupZ(value); saveInLocalStorage("workgroupZ", value); }

    const savedDispatchX = getFromLocalStorage("dispatchX");
    const savedDispatchY = getFromLocalStorage("dispatchY");
    const savedDispatchZ = getFromLocalStorage("dispatchZ");
    const [dispatchX, setDispatchX] = useState(savedDispatchX);
    const [dispatchY, setDispatchY] = useState(savedDispatchY);
    const [dispatchZ, setDispatchZ] = useState(savedDispatchZ);
    function handleDispatchX(value) { setDispatchX(value); saveInLocalStorage("dispatchX", value); }
    function handleDispatchY(value) { setDispatchY(value); saveInLocalStorage("dispatchY", value); }
    function handleDispatchZ(value) { setDispatchZ(value); saveInLocalStorage("dispatchZ", value); }

    const [currentNumofThread, setCurrentNumofThread] = useState(1);
    useEffect(() => {
        setCurrentNumofThread((workgroupX * workgroupY * workgroupZ * dispatchX * dispatchY * dispatchZ).toLocaleString());
    }, [workgroupX, workgroupY, workgroupZ, dispatchX, dispatchY, dispatchZ])

    const [recordState, setRecordState] = useState(false);
    function handleRecordToggle(value) { setRecordState(value); }

    const [harshState, setHarshState] = useState(false);
    function handleHarshToggle(value) { setHarshState(value); }

    const [ wgslIter, setWgslIter ] = useState(3);
    function handleWgslIter(value) { setWgslIter(value); }

    const savedDuration = getFromLocalStorage("duration");
    const [duration, setDuration] = useState(savedDuration);
    function handleDuration(value) { setDuration(value); saveInLocalStorage("duration", value); }
    const [deviceName, setDeviceName] = useState("none");
    function handleDeviceNameChange(value) { setDeviceName(value); }

    return (
        <div style={{ display: "flex", flexDirection: "column", paddingLeft: "50px", backgroundColor: "#c2dfbdff" }}>
            <div style={{ display: "flex", flexDirection: 'row', alignItems: "center" }}>
                <p style={{ fontSize: "20px", marginRight: "10px" }}>Device :</p>
                <select onChange={(e) => handleDeviceNameChange(e.target.value)} style={{ fontSize: '20px', width: 'fit-content', height: 'fit-content' }}>
                    <option value="none">None</option>
                    <option value="m1">m1air</option>
                    <option value="m2">m1pro</option>
                    <option value="m3">m3pro</option>
                    <option value="RTX3090">RTX3090</option>
                    <option value="RTX2070S">RTX2070S</option>
                    <option value="RTX_A5000">RTX_A5000</option>
                </select>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "16px" }}>
                <input type="checkbox" checked={harshState} onChange={(e) => handleHarshToggle(e.target.checked)} />
                Harsh?
            </label>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", fontSize: "20px" }}>
                <p>WGSL Iteration :</p>
                <input type="number" value={wgslIter} onChange={(e) => handleWgslIter(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: "24px" }}>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", fontSize: "20px", marginTop: "-20px" }}>
                    <p>- workgroup_size() : </p>
                    <input type="number" placeholder="million unit" value={workgroupX} onChange={(e) => handleworkgroupX(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                    <input type="number" placeholder="million unit" value={workgroupY} onChange={(e) => handleworkgroupY(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                    <input type="number" placeholder="million unit" value={workgroupZ} onChange={(e) => handleworkgroupZ(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", fontSize: "20px", margin: "-20px 0px", }}>
                    <p>- dispatchWorkgroups() : </p>
                    <input type="number" placeholder="million unit" value={dispatchX} onChange={(e) => handleDispatchX(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                    <input type="number" placeholder="million unit" value={dispatchY} onChange={(e) => handleDispatchY(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                    <input type="number" placeholder="million unit" value={dispatchZ} onChange={(e) => handleDispatchZ(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                </div>
                <p>➡️ current number of thread to invoke = {currentNumofThread}</p>
                <p style={{ fontSize: "14px", marginTop: "-20px" }}> tip: 64*15625 == 1M </p>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center", fontSize: "20px", marginTop: "-20px" }}>
                    <p>- Duration(s) : </p>
                    <input type="number" value={duration} onChange={(e) => handleDuration(e.target.value)} style={{ width: "140px", fontSize: "24px", height: "30px" }} />
                    <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "16px" }}>
                        <input type="checkbox" checked={recordState} onChange={(e) => handleRecordToggle(e.target.checked)} />
                        Record
                    </label>
                    <Button clickEvent={() => runPerformance(workgroupX, workgroupY, workgroupZ, dispatchX, dispatchY, dispatchZ, duration, recordState, harshState, wgslIter)} name={"Run"} />
                </div>
            </div>
        </div >
    )
}