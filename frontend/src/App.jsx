import React, { useState, useRef } from "react";
import './App.css'  

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secPass, setSecPass] = useState("");
  const [inputStr, setInputStr] = useState("");
  const [logs, setLogs] = useState([]);
    const [logs1, setLogs1] = useState([]);
  // const [running, setRunning] = useState(false);
  const eventSourceRef = useRef(null);
  const[togle,settogle]=useState(false)

  // helper: split by comma/newline, trim, remove empty, limit 50
  function parseStrings(raw) {
    const parts = raw
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.slice(0, 50);
  }

  async function startScript() {
    const arr = parseStrings(inputStr);
    if (!email || !password || !secPass || arr.length === 0) {
      alert("Please fill all fields and enter at least 1 string!");
      return;
    }
    

    setLogs([]);
    // setRunning(true);

    await fetch("http://localhost:5000/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, secPass, strings: arr }),
    });

    // live logs via SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource("http://localhost:5000/logs");
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      setLogs((prev) => [...prev, e.data]);
    };
    es.onerror = () => {
      es.close();
      // setRunning(false);
    };
  }
async function getjobid(){
  const arr = parseStrings(inputStr);
    if (!email || !password || !secPass || arr.length === 0) {
      alert("Please fill all fields and enter at least 1 string!");
      return;
    }
    

    setLogs1([]);
    // setRunning(true);
 
   const result= await fetch("http://localhost:5100/getjobid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({email, password, secPass, strings: arr }),
    });
    // console.log("this is the result",result.data)
    // live logs via SSE
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    const es = new EventSource("http://localhost:5100/logs");
    eventSourceRef.current = es;

    es.onmessage = (e) => {
      console.log(e,e.data)
      const parsed = JSON.parse(e.data)
      setLogs1((prev) => [...prev, ...parsed]);
      settogle(true)
      console.log(logs1)
    };
    es.onerror = () => {
      es.close();
      // setRunning(false);
    };
}


  return (
    <div className="mainconatiner">
      <h1 className="heading">Automated Deployment</h1>
<div className="minicontainer"> 
     <input
        className="email-input"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="password-input"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        className="security-input"
        placeholder="Security Password"
        onChange={(e) => setSecPass(e.target.value)}
      />
 
      <button
        onClick={startScript}
      
        className=""button
      >
         Start
      </button>
</div>
<div className="btmtextarea"> 
 <textarea
        className="text-area"
        rows="5"
        placeholder="Enter strings (comma or newline separated, max 50)"
        onChange={(e) => setInputStr(e.target.value)}
      /><button
        onClick={getjobid}
        
        className="buttons"
      >
        GetjobID
      </button>
      </div>
      {togle && (<table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">PO NAME</th>
            <th className="border border-gray-300 px-4 py-2">JOB ID</th>
            <th className="border border-gray-300 px-4 py-2">JOB SIZE</th>
            <th className="border border-gray-300 px-4 py-2">STATUS</th>
             <th className="border border-gray-300 px-4 py-2">TOTAL TIME</th>
          </tr>
        </thead>
        <tbody>
          {logs1.map((item,i) => (
            
            <tr key={i} className="rows1">
              <td className="border border-gray-300 px-4 py-2">{item.poname}</td>
              <td className="border border-gray-300 px-4 py-2">{item.jobIDs}</td>
              <td className="border border-gray-300 px-4 py-2">{item.jobSizes}</td>
              <td className="border border-gray-300 px-4 py-2">{item.status}</td>
              <td className="border border-gray-300 px-4 py-2">{item.totaTime}</td>
            </tr>
          ))
    
          
          }
           

   {(() => {
  const result = logs1.reduce(
    (acc, item) => {
      const sizeStr = item.jobSizes.replace(/[^0-9.]/g, ""); // sirf digit aur . rakhega
      const sizeNum = parseFloat(sizeStr);
      acc.total += sizeNum;   // sum
      acc.ids.push(item.jobIDs);    // collect in array
      return acc;
    },
    { total: 0, ids: [] } // initial
  );

  return (
    <div style={{ display: "flex", gap: "24px",marginTop:"20px",fontWeight:"bold" }}>
      <span>Total jobSizes: {result.total}</span>
      <span>IDs: {result.ids.join(", ")}</span>
    </div>
  );
})()}
        </tbody>
      </table>
       
    )  }
      <div className="bg-black text-green-400 mt-7 p-2 h-64 overflow-y-scroll font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
