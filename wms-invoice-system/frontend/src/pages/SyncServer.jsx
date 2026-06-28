import { useEffect, useState, useRef } from "react";

function SyncServer() {

  const [status, setStatus] = useState("Not Sync");
const [lastSync, setLastSync] = useState("-");

const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");

const [deletePassword, setDeletePassword] = useState("");
const [deleteStatus, setDeleteStatus] = useState("");

const [deleteImport, setDeleteImport] = useState(true);
const [deleteExport, setDeleteExport] = useState(true);

const [summary, setSummary] = useState({
  invoices: 0,
  exports: 0,
  suppliers: 0,
  products: 0
});

// เพิ่มตรงนี้
const fromRef = useRef(null);
const toRef = useRef(null);
  const syncNow =
  async()=>{

    try{

      setStatus("Syncing...");

      const invoices =
      await fetch(
      "http://localhost:3002/invoices"
      ).then(r=>r.json());

      const exportsData =
      await fetch(
      "http://localhost:3002/exports"
      ).then(r=>r.json());

      const suppliers =
      await fetch(
      "http://localhost:3002/suppliers"
      ).then(r=>r.json());

      const stock =
      await fetch(
      "http://localhost:3002/stocks"
      ).then(r=>r.json());

      await fetch(

      "http://192.168.1.100:3002/sync/imports",

      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(
          invoices
        )
      }

      );

      await fetch(

      "http://192.168.1.100:3002/sync/exports",

      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(
          exportsData
        )
      }

      );

      setSummary({

        invoices:
        invoices.length,

        exports:
        exportsData.length,

        suppliers:
        suppliers.length,

        products:
        stock.length

      });

      setLastSync(
      new Date()
      .toLocaleString()
      );

      setStatus(
      "Sync Success"
      );

    }catch(err){

      console.log(err);

      setStatus(
      "Sync Failed"
      );

    }

  };

const deleteByDate = async () => {

  if (!fromDate || !toDate) {
    alert("กรุณาเลือกวันที่");
    return;
  }

  if (deletePassword !== "1234") {
    alert("Password ไม่ถูกต้อง");
    return;
  }

  try {

    const res = await fetch(
      "http://localhost:3002/delete-by-date",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({

          fromDate,
          toDate,

          deleteImport,
          deleteExport

        })
      }
    );

    const data = await res.json();

    alert(data.message);

  } catch(err) {

    console.log(err);

    alert("Delete Failed");

  }

};

  useEffect(()=>{

    const timer =
    setInterval(
      syncNow,
      30000
    );

    return()=>{

      clearInterval(
        timer
      );

    };

  },[]);

  return(

    <div>

      <h1>
        🔄 Sync Main Server
      </h1>

      <div className="card">

        <h2>
          Status :
          {status}
        </h2>

        <button
        onClick={syncNow}>
          🔄 Sync Now
        </button>

      </div>

      {/* Delete Data Card */}
      <div className="card">

        <h2>
          🗑 Delete Import / Export Data
        </h2>

        <p>
          Delete data by selected date range
        </p>

        <div className="form-group">
  <label>From Date</label>
  <input
    ref={fromRef}
    type="date"
    className="form-control"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    onClick={(e) => e.target.showPicker?.()}
  />
</div>

<br />

<div className="form-group">
  <label>To Date</label>
  <input
    ref={toRef}
    type="date"
    className="form-control"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    onClick={(e) => e.target.showPicker?.()}
  />
</div>

        <br/>

        <div className="form-group">
          <label>Password</label>
          <input
  type="password"
  className="form-control"
  placeholder="Enter Password"
  value={deletePassword}
  onChange={(e) => setDeletePassword(e.target.value)}
/>
        </div>

        <br/>

        <label>
          <input
  type="checkbox"
  checked={deleteImport}
  onChange={(e)=>setDeleteImport(e.target.checked)}
/>
          {" "}Import
        </label>

        <br/>

        <label>
          <input
  type="checkbox"
  checked={deleteExport}
  onChange={(e)=>setDeleteExport(e.target.checked)}
/>
          {" "}Export
        </label>

        <br/>
        <br/>

        <button
  className="btn btn-danger"
  onClick={deleteByDate}
>
  🗑 Delete Data
</button>

      </div>

      <div
      className="dashboard-cards">

        <div className="stat-card">

          <h3>
            Invoice
          </h3>

          <h2>
            {summary.invoices}
          </h2>

        </div>

        <div className="stat-card">

          <h3>
            Export
          </h3>

          <h2>
            {summary.exports}
          </h2>

        </div>

        <div className="stat-card">

          <h3>
            Supplier
          </h3>

          <h2>
            {summary.suppliers}
          </h2>

        </div>

        <div className="stat-card">

          <h3>
            Product
          </h3>

          <h2>
            {summary.products}
          </h2>

        </div>

      </div>

      <div className="card">

        <h3>
          Last Sync
        </h3>

        <p>
          {lastSync}
        </p>

      </div>

    </div>

  );

}

export default SyncServer;