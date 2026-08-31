import { useEffect, useState } from "react";

function SyncServer() {

  const API = "http://localhost:3002";

  const [status, setStatus] = useState("Disconnected");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
const [progressText, setProgressText] = useState("");
  const [lastSync, setLastSync] = useState("-");

  const [summary, setSummary] = useState({
    invoices: 0,
    exports: 0,
    suppliers: 0,
    products: 0,
  });

  const [mainConfig, setMainConfig] = useState({
    ip: "192.168.1.100",
    port: "3002",
  });

  const [gateConfig, setGateConfig] = useState({
    ip: "192.168.1.101",
    port: "3002",
  });

  const [mainStatus, setMainStatus] = useState("Not Test");
  const [gateStatus, setGateStatus] = useState("Not Test");

  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(30);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [deletePassword, setDeletePassword] = useState("");

  const [deleteImport, setDeleteImport] = useState(true);
  const [deleteExport, setDeleteExport] = useState(true);

  useEffect(() => {

    const main = JSON.parse(localStorage.getItem("mainServer"));
    const gate = JSON.parse(localStorage.getItem("gateServer"));

    if (main) setMainConfig(main);
    if (gate) setGateConfig(gate);

  }, []);

  const saveMainConfig = () => {

    localStorage.setItem(
      "mainServer",
      JSON.stringify(mainConfig)
    );

    alert("Main Server Saved");

  };

  const saveGateConfig = () => {

    localStorage.setItem(
      "gateServer",
      JSON.stringify(gateConfig)
    );

    alert("Gate Server Saved");

  };

  const testServer = async (config, setter) => {

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 3000);

  try {

    const res = await fetch(
      `http://${config.ip}:${config.port}/health`,
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (res.ok) {
      setter("🟢 Online");
    } else {
      setter("🔴 Offline");
    }

  } catch {

    clearTimeout(timeout);

    setter("🔴 Offline");

}

};

  const testMainServer = () => {

    testServer(mainConfig, setMainStatus);

  };

  const testGateServer = () => {

    testServer(gateConfig, setGateStatus);

  };

  const postData = async (url, body) => {

    const res = await fetch(url, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(body)

    });

    if (!res.ok) {

      throw new Error(url);

    }

    res.json({
    success:true
});

  };

  const getData = async (url) => {

    const res = await fetch(url);

    if (!res.ok) {

      throw new Error(url);

    }

    res.json({
    success:true
});

  };

  const syncNow = async () => {

    if (loading) return;

    try {

      setLoading(true);

      setStatus("Synchronizing...");

      setProgress(10);
setProgressText("Loading Invoice...");

      const invoices = await getData(`${API}/invoices`);

      setProgress(25);
setProgressText("Loading Export...");

      const exportsData = await getData(`${API}/exports`);

      setProgress(40);
setProgressText("Loading Supplier...");

      const suppliers = await getData(`${API}/suppliers`);

      setProgress(55);
setProgressText("Loading Stock...");

      const stocks = await getData(`${API}/stocks`);

      setProgress(65);
setProgressText("Sync Invoice...");

      await postData(
        `http://${mainConfig.ip}:${mainConfig.port}/sync/imports`,
        invoices
      );

      setProgress(75);
setProgressText("Sync Export...");

      await postData(
        `http://${mainConfig.ip}:${mainConfig.port}/sync/exports`,
        exportsData
      );

      setProgress(85);
setProgressText("Sync Supplier...");

      await postData(
        `http://${mainConfig.ip}:${mainConfig.port}/sync/suppliers`,
        suppliers
      );

      setProgress(95);
setProgressText("Sync Stock...");

      await postData(
        `http://${mainConfig.ip}:${mainConfig.port}/sync/stocks`,
        stocks
      );

      setSummary({

        invoices: invoices.length,

        exports: exportsData.length,

        suppliers: suppliers.length,

        products: stocks.length,

      });

      setLastSync(new Date().toLocaleString());

      setStatus("Connected");

setMainStatus("🟢 Online");

setProgress(100);
setProgressText("Completed");

await new Promise(resolve => setTimeout(resolve,1000));

} catch (err) {

    console.log(err);

    setStatus("Disconnected");

    setMainStatus("🔴 Offline");

    setSummary({

        invoices:0,
        exports:0,
        suppliers:0,
        products:0,

    });

    setProgress(0);

    setProgressText("Failed");

} finally {

    setLoading(false);

}

  };
    const deleteByDate = async () => {

    if (!fromDate || !toDate) {
      alert("Please select date.");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(`${API}/delete-by-date`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          fromDate,
          toDate,

          deleteImport,
          deleteExport,

          password: deletePassword,

        }),

      });

      if (!res.ok) {

        throw new Error();

      }

      const data = await res.json();

      alert(data.message);

      setStatus("Disconnected");
setProgress(0);
setProgressText("");

      setSummary({
        invoices: 0,
        exports: 0,
        suppliers: 0,
        products: 0,
      });

      setLastSync("-");
      setDeletePassword("");

    } catch (err) {

      console.log(err);

      alert("Delete Failed");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    if (!autoSync) return;

    const timer = setInterval(() => {

        if (!loading) {
            syncNow();
        }

    }, syncInterval * 1000);

    return () => clearInterval(timer);

}, [
    autoSync,
    syncInterval,
    loading,
    mainConfig.ip,
    mainConfig.port,
]);

  return (

    <>

      <div className="dashboard-header">

        <div>

          <h1 className="dashboard-title">

            🔄 Sync Server Center

          </h1>

          <p className="dashboard-subtitle">

            Configure Server & Synchronize Database

          </p>

        </div>

      </div>

      <div className="summary-grid">

        <div className="summary-card card-blue">

          <h4>Status</h4>

          <div className="summary-value">

            {loading ? "Synchronizing..." : status}

          </div>

        </div>

        <div className="summary-card card-green">

          <h4>Progress</h4>

          <div className="summary-value">

    {progress}%

    <br />

    {progressText}

</div>

        </div>

        <div className="summary-card card-orange">

          <h4>Last Sync</h4>

          <div className="summary-value">

            {lastSync}

          </div>

        </div>

      </div>

            {/* Main Server */}

      <div className="panel">

        <h3>🌐 Main Server</h3>

        <div className="supplier-form-grid">

          <input
            placeholder="Server IP"
            value={mainConfig.ip}
            onChange={(e) =>
              setMainConfig({
                ...mainConfig,
                ip: e.target.value,
              })
            }
          />

          <input
            placeholder="Port"
            value={mainConfig.port}
            onChange={(e) =>
              setMainConfig({
                ...mainConfig,
                port: e.target.value,
              })
            }
          />

        </div>

        <div className="sync-btn-group">

          <button
            className="sync-btn"
            disabled={loading}
            onClick={testMainServer}
          >
            🌐 Test
          </button>

          <button
            className="sync-btn"
            disabled={loading}
            onClick={saveMainConfig}
          >
            💾 Save
          </button>

        </div>

        <p className="sync-status">

          Status :

          <strong>

            {mainStatus}

          </strong>

        </p>

      </div>

      {/* Gate Server */}

      <div className="panel">

        <h3>🚛 Gate In-Out Server</h3>

        <div className="supplier-form-grid">

          <input
            placeholder="Gate IP"
            value={gateConfig.ip}
            onChange={(e) =>
              setGateConfig({
                ...gateConfig,
                ip: e.target.value,
              })
            }
          />

          <input
            placeholder="Port"
            value={gateConfig.port}
            onChange={(e) =>
              setGateConfig({
                ...gateConfig,
                port: e.target.value,
              })
            }
          />

        </div>

        <div className="sync-btn-group">

          <button
            className="sync-btn"
            disabled={loading}
            onClick={testGateServer}
          >
            🌐 Test
          </button>

          <button
            className="sync-btn"
            disabled={loading}
            onClick={saveGateConfig}
          >
            💾 Save
          </button>

        </div>

        <p className="sync-status">

          Status :

          <strong>

            {gateStatus}

          </strong>

        </p>

      </div>

      
                  {/* Auto Sync */}

      <div className="panel">

        <h3>⚙️ Auto Sync Setting</h3>

        <div className="sync-checkbox-group">

          <label className="sync-checkbox">

            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) =>
                setAutoSync(e.target.checked)
              }
            />

            Enable Auto Sync

          </label>

        </div>

        <br />

        <label>

          Sync Interval (Second)

        </label>

        <input
          type="number"
          min={5}
          className="form-control"
          value={syncInterval}
          onChange={(e) =>
            setSyncInterval(Number(e.target.value))
          }
        />

      </div>

      {/* Manual Sync */}

      <div className="panel">

        <div className="sync-toolbar">

          <div>

            <h3>

              🔄 Manual Synchronize

            </h3>

            <p className="sync-description">

              Send Local Database to Main Server

            </p>

          </div>

          <button
            className="sync-btn"
            disabled={loading}
            onClick={syncNow}
          >

            {loading ? "⏳ Synchronizing..." : "🔄 Sync Now"}

          </button>

        </div>

      </div>
            {/* Summary */}

      <div className="dashboard-cards">

        <div className="stat-card">

          <h3>Invoice</h3>

          <h2>{summary.invoices}</h2>

        </div>

        <div className="stat-card">

          <h3>Export</h3>

          <h2>{summary.exports}</h2>

        </div>

        <div className="stat-card">

          <h3>Supplier</h3>

          <h2>{summary.suppliers}</h2>

        </div>

        <div className="stat-card">

          <h3>Product</h3>

          <h2>{summary.products}</h2>

        </div>

      </div>

      {/* Delete Data */}

      <div className="panel">

        <h3>🗑 Delete Import / Export Data</h3>

        <p className="sync-description">

          Delete data by selected date range

        </p>

        <div className="supplier-form-grid">

          <div>

            <label>From Date</label>

            <input
              type="date"
              className="form-control"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />

          </div>

          <div>

            <label>To Date</label>

            <input
              type="date"
              className="form-control"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />

          </div>

        </div>

        <br />

        <label>Password</label>

        <input
          type="password"
          className="form-control"
          placeholder="Enter Password"
          value={deletePassword}
          onChange={(e) =>
            setDeletePassword(e.target.value)
          }
        />

        <br />

        <div className="sync-checkbox-group">

          <label className="sync-checkbox">

            <input
              type="checkbox"
              checked={deleteImport}
              onChange={(e) =>
                setDeleteImport(e.target.checked)
              }
            />

            Delete Import

          </label>

          <label className="sync-checkbox">

            <input
              type="checkbox"
              checked={deleteExport}
              onChange={(e) =>
                setDeleteExport(e.target.checked)
              }
            />

            Delete Export

          </label>

        </div>

        <button
          className="sync-delete-btn"
          disabled={loading}
          onClick={deleteByDate}
        >

          {loading ? "Deleting..." : "🗑 Delete Data"}

        </button>

      </div>

                  {/* Last Synchronize */}

      <div className="panel">

        <h3>📅 Last Synchronize</h3>

        <div className="summary-value">

          {lastSync}

        </div>

      </div>

      {/* Progress */}

      {loading && (

        <div className="panel">

          <h3>⏳ Synchronizing...</h3>

          <div
            style={{
              width: "100%",
              height: "18px",
              background: "#e5e7eb",
              borderRadius: "20px",
              overflow: "hidden",
              marginTop: "10px",
            }}
          >

            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#16a34a",
                transition: "0.3s",
              }}
            />

          </div>

          <div
    style={{
        textAlign: "center",
        marginTop: "8px",
        fontWeight: "bold",
    }}
>

    {progress} %

    <br />

    {progressText}

</div>

        </div>

      )}

      {/* Loading Overlay */}

      {loading && (

        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,.45)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >

          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
              minWidth: "280px",
            }}
          >

            <h2>Synchronizing...</h2>

            <h1>{progress}%</h1>

<p>{progressText}</p>

          </div>

        </div>

      )}

    </>

  );

}

export default SyncServer;