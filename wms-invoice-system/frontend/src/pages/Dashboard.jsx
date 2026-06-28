// File: src/pages/Dashboard.jsx (corrected)
import { useEffect, useState } from "react";

function Dashboard() {
  // Initialize to today (ISO format YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [keyword, setKeyword] = useState("");
  const [importPage, setImportPage] = useState(1);
  const [exportPage, setExportPage] = useState(1);
  const [importPages, setImportPages] = useState(1);
  const [exportPages, setExportPages] = useState(1);
  const [summary, setSummary] = useState({});
  const [recentImport, setRecentImport] = useState([]);
  const [recentExport, setRecentExport] = useState([]);

  // Load summary on mount
  useEffect(() => {

  async function loadDashboard(){

    const res = await fetch(
      `http://localhost:3002/dashboard?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );

    const data = await res.json();

    setSummary(data);

  }

  loadDashboard();

}, [dateFrom, dateTo]);

  // Load recent imports whenever page or date range changes
  useEffect(() => {
    async function loadRecentImport() {
      try {
        const res = await fetch(
          `http://localhost:3002/dashboard/recent-import?page=${importPage}&dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
        const data = await res.json();
        console.log("IMPORT", data);
        setRecentImport(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadRecentImport();
  }, [importPage, dateFrom, dateTo]);

  // Load recent exports whenever page or date range changes
  useEffect(() => {
    async function loadRecentExport() {
      try {
        const res = await fetch(
          `http://localhost:3002/dashboard/recent-export?page=${exportPage}&dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
        const data = await res.json();
        console.log("EXPORT", data);
        setRecentExport(data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadRecentExport();
  }, [exportPage, dateFrom, dateTo]);

  // Update pagination when date range changes
  useEffect(() => {
    async function loadPages() {
      try {
        const resImp = await fetch(
          `http://localhost:3002/dashboard/import-pages?dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
        const impData = await resImp.json();
        setImportPages(impData.pages || 1);
      } catch (err) {
        console.error(err);
      }
      try {
        const resExp = await fetch(
          `http://localhost:3002/dashboard/export-pages?dateFrom=${dateFrom}&dateTo=${dateTo}`
        );
        const expData = await resExp.json();
        setExportPages(expData.pages || 1);
      } catch (err) {
        console.error(err);
      }
      setImportPage(1);
      setExportPage(1);
    }
    loadPages();
  }, [dateFrom, dateTo]);

  // Helper to download Excel reports
  const downloadExcel = (type) => {

    let url =
    `http://localhost:3002/export-excel/${type}`;

    const params = new URLSearchParams();

    if(dateFrom)
        params.append("dateFrom",dateFrom);

    if(dateTo)
        params.append("dateTo",dateTo);

    if(params.toString()){

        url += "?" + params.toString();

    }

    window.location.href = url;

};

  // Filter imports/exports by keyword
  const importFiltered = recentImport.filter(item => {
    const text = `${item.invoice_no || ""} ${item.product_name || ""}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });
  const exportFiltered = recentExport.filter(item => {
    const text = `${item.invoice_no || ""} ${item.product_name || ""}`.toLowerCase();
    return text.includes(keyword.toLowerCase());
  });

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">📊 Warehouse Dashboard</h1>
          <p className="dashboard-subtitle">Inventory Management System</p>
        </div>
        <div className="dashboard-filter">
          <input
            type="text"
            placeholder="🔍 Search Invoice / Product"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="search-input"
          />
          <div className="date-range-group" onClick={e => e.currentTarget.querySelector("input").focus()}>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              onFocus={e => e.target.showPicker()}  /* native picker (Chrome/Edge) */
              className="date-input"
            />
            <span className="date-separator">→</span>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              onFocus={e => e.target.showPicker()}
              className="date-input"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY */}
<div className="summary-grid">

  <div className="summary-card blue">
    <div className="card-icon">📥</div>
    <div className="card-info">
      <span>Total Import</span>
      <h2>{Number(summary.totalImport || 0).toLocaleString()}</h2>
    </div>
  </div>

  <div className="summary-card purple">
    <div className="card-icon">📤</div>
    <div className="card-info">
      <span>Total Export</span>
      <h2>{Number(summary.totalExport || 0).toLocaleString()}</h2>
    </div>
  </div>

  <div className="summary-card cyan">
    <div className="card-icon">📦</div>
    <div className="card-info">
      <span>Current Stock</span>
      <h2>{Number(summary.stockQty || 0).toLocaleString()}</h2>
    </div>
  </div>

  <div className="summary-card green">
    <div className="card-icon">⚖️</div>
    <div className="card-info">
      <span>Total Weight</span>
      <h2>{Number(summary.stockWeight || 0).toLocaleString()}</h2>
    </div>
  </div>

  <div className="summary-card orange">
    <div className="card-icon">💰</div>
    <div className="card-info">
      <span>Import Value</span>
      <h2>{Number(summary.importValue || 0).toLocaleString()}</h2>
    </div>
  </div>

  <div className="summary-card red">
    <div className="card-icon">💸</div>
    <div className="card-info">
      <span>Export Value</span>
      <h2>{Number(summary.exportValue || 0).toLocaleString()}</h2>
    </div>
  </div>

  <div className="summary-card dark">
    <div className="card-icon">📈</div>
    <div className="card-info">
      <span>Balance Value</span>
      <h2>{Number(summary.profit || 0).toLocaleString()}</h2>
    </div>
  </div>

</div>

      {/* MOVEMENT */}
      <div className="panel">
        <h3>📈 Inventory Movement</h3>
        <div className="progress-row">
          <span>Import Qty</span>
          <div className="progress">
            <div
              className="progress-fill import-fill"
              style={{ width: "100%" }}
            />
          </div>
          <strong>{summary.importQty || 0}</strong>
        </div>
        <div className="progress-row">
          <span>Export Qty</span>
          <div className="progress">
            <div
              className="progress-fill export-fill"
              style={{
                width: `${
                  summary.importQty ? (summary.exportQty / summary.importQty) * 100 : 0
                }%`
              }}
            />
          </div>
          <strong>{summary.exportQty || 0}</strong>
        </div>
        <div className="progress-row">
          <span>Remaining</span>
          <div className="progress">
            <div
              className="progress-fill stock-fill"
              style={{
                width: `${
                  summary.importQty ? (summary.stockQty / summary.importQty) * 100 : 0
                }%`
              }}
            />
          </div>
          <strong>{summary.stockQty || 0}</strong>
        </div>
      </div>

      {/* RECENT SECTION */}
      <div className="recent-grid">
        {/* IMPORT */}
        <div className="panel">
          <div className="panel-header">
            <h3>📥 Recent Import</h3>
          </div>
          <table className="modern-table">
            <thead>
  <tr>
    <th>Invoice</th>
    <th>Product</th>
    <th>Qty</th>
    <th>Unit Price</th>
    <th>Total Price</th>
    <th>Files</th>
  </tr>
</thead>
            <tbody className="recent-body">
  {importFiltered.map(item => (
    <tr key={item.id}>
      <td>{item.invoice_no}</td>
      <td>{item.product_name}</td>
      <td>{item.qty}</td>
      <td>{item.unit_price}</td>
      <td>{item.total_price}</td>

      <td>

<details>

<summary>📎 Files</summary>

{item.invoice_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.invoice_file}`}
target="_blank"
rel="noreferrer"
>
Invoice
</a>
</div>
)}

{item.acdd_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.acdd_file}`}
target="_blank"
rel="noreferrer"
>
ACDD
</a>
</div>
)}

{item.formd_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.formd_file}`}
target="_blank"
rel="noreferrer"
>
FORM D
</a>
</div>
)}

{item.truck_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.truck_file}`}
target="_blank"
rel="noreferrer"
>
Truck
</a>
</div>
)}

{item.payment_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.payment_file}`}
target="_blank"
rel="noreferrer"
>
Payment
</a>
</div>
)}

{item.fda_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.fda_file}`}
target="_blank"
rel="noreferrer"
>
FDA
</a>
</div>
)}

{item.import_license_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.import_license_file}`}
target="_blank"
rel="noreferrer"
>
Import License
</a>
</div>
)}

</details>

</td>
    </tr>
  ))}
</tbody>
          </table>
          <div className="pagination">
            <button disabled={importPage === 1} onClick={() => setImportPage(importPage - 1)}>◀</button>
            {Array.from({ length: importPages }).map((_, i) => (
              <button
                key={i}
                className={importPage === i+1 ? "active-page" : ""}
                onClick={() => setImportPage(i+1)}
              >
                {i+1}
              </button>
            ))}
            <button disabled={importPage === importPages} onClick={() => setImportPage(importPage + 1)}>▶</button>
          </div>
        </div>

        {/* EXPORT */}
        <div className="panel">
          <div className="panel-header">
            <h3>📤 Recent Export</h3>
          </div>
          <table className="modern-table">
            <thead>
  <tr>
    <th>Invoice</th>
    <th>Product</th>
    <th>Qty</th>
    <th>Unit Price</th>
    <th>Total Price</th>
    <th>Files</th>
  </tr>
</thead>
            <tbody className="recent-body">
  {exportFiltered.map(item => (
    <tr key={item.id}>
      <td>{item.invoice_no}</td>
      <td>{item.product_name}</td>
      <td>{item.qty}</td>
      <td>{item.unit_price}</td>
      <td>{item.total_price}</td>
      <td>

<details>

<summary>📎 Files</summary>

{item.invoice_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.invoice_file}`}
target="_blank"
rel="noreferrer"
>
Invoice
</a>
</div>
)}

{item.payment_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.payment_file}`}
target="_blank"
rel="noreferrer"
>
Payment
</a>
</div>
)}

{item.formd_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.formd_file}`}
target="_blank"
rel="noreferrer"
>
FORM D
</a>
</div>
)}

{item.phytos_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.phytos_file}`}
target="_blank"
rel="noreferrer"
>
PHYTOS
</a>
</div>
)}

{item.tax_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.tax_file}`}
target="_blank"
rel="noreferrer"
>
Tax
</a>
</div>
)}

{item.export_license_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.export_license_file}`}
target="_blank"
rel="noreferrer"
>
Export License
</a>
</div>
)}

{item.origin_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.origin_file}`}
target="_blank"
rel="noreferrer"
>
Origin
</a>
</div>
)}

{item.acdd_file && (
<div>
<a
href={`http://localhost:3002/uploads/${item.acdd_file}`}
target="_blank"
rel="noreferrer"
>
ACDD
</a>
</div>
)}

</details>

</td>      

    </tr>
  ))}
</tbody>
          </table>
          <div className="pagination">
            <button disabled={exportPage === 1} onClick={() => setExportPage(exportPage - 1)}>◀</button>
            {Array.from({ length: exportPages }).map((_, i) => (
              <button
                key={i}
                className={exportPage === i+1 ? "active-page" : ""}
                onClick={() => setExportPage(i+1)}
              >
                {i+1}
              </button>
            ))}
            <button disabled={exportPage === exportPages} onClick={() => setExportPage(exportPage + 1)}>▶</button>
          </div>
        </div>
      </div>

      {/* EXPORT CENTER */}
      <div className="panel">
        <h3>📑 Export Center</h3>
        <p style={{ marginTop: "5px", color: "#666" }}>
          {dateFrom || dateTo
            ? `ช่วงวันที่ ${dateFrom || "-"} ถึง ${dateTo || "-"}`
            : "Export ข้อมูลทั้งหมด"}
        </p>
        <div className="export-grid">
    <button onClick={()=>downloadExcel("stock")}>📦 Stock Report</button>
    <button onClick={()=>downloadExcel("import")}>📥 Import Report</button>
    <button onClick={()=>downloadExcel("export")}>📤 Export Report</button>
    <button onClick={()=>downloadExcel("supplier")}>🏪 Supplier Report</button>
    <button onClick={()=>downloadExcel("summary")}>📊 Summary Report</button>
</div>
      </div>
    </div>
  );
}

export default Dashboard;
