
import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  API
} from "../config/api";


function SyncServer() {


  // =====================================================
  // API
  // =====================================================

  const BASE_API =
    API ||
    "http://localhost:3002";


  // =====================================================
  // AUTH
  // =====================================================

  const token =
    localStorage.getItem(
      "token"
    );


  // =====================================================
  // STATE
  // =====================================================

  const [
    status,
    setStatus
  ] =
    useState(
      "Disconnected"
    );


  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );


  const [
    progress,
    setProgress
  ] =
    useState(
      ""
    );


  const [
    lastSync,
    setLastSync
  ] =
    useState(
      "-"
    );


  const [
    summary,
    setSummary
  ] =
    useState({

      invoices:
        0,

      exports:
        0,

      suppliers:
        0,

      products:
        0

    });


  const [
    mainConfig,
    setMainConfig
  ] =
    useState({

      ip:
        "192.168.1.100",

      port:
        "3002"

    });


  const [
    gateConfig,
    setGateConfig
  ] =
    useState({

      ip:
        "192.168.1.101",

      port:
        "3002"

    });


  const [
    mainStatus,
    setMainStatus
  ] =
    useState(
      "Not Test"
    );


  const [
    gateStatus,
    setGateStatus
  ] =
    useState(
      "Not Test"
    );


  const [
    autoSync,
    setAutoSync
  ] =
    useState(
      true
    );


  const [
    syncInterval,
    setSyncInterval
  ] =
    useState(
      30
    );


  const [
    fromDate,
    setFromDate
  ] =
    useState(
      ""
    );


  const [
    toDate,
    setToDate
  ] =
    useState(
      ""
    );


  const [
    deletePassword,
    setDeletePassword
  ] =
    useState(
      ""
    );


  const [
    deleteImport,
    setDeleteImport
  ] =
    useState(
      true
    );


  const [
    deleteExport,
    setDeleteExport
  ] =
    useState(
      true
    );


  // =====================================================
  // AUTH HEADERS
  // =====================================================

  const getAuthHeaders =
    useCallback(
      (
        json = false
      ) => {

        const headers =
          {};


        if (
          json
        ) {

          headers[
            "Content-Type"
          ] =
            "application/json";

        }


        if (
          token
        ) {

          headers.Authorization =
            `Bearer ${token}`;

        }


        return headers;

      },
      [
        token
      ]
    );


  // =====================================================
  // LOAD SAVED SERVER CONFIG
  // =====================================================

  useEffect(
    () => {

      try {

        const main =
          localStorage.getItem(
            "mainServer"
          );


        const gate =
          localStorage.getItem(
            "gateServer"
          );


        if (
          main
        ) {

          const parsedMain =
            JSON.parse(
              main
            );


          if (
            parsedMain &&
            typeof parsedMain ===
              "object"
          ) {

            setMainConfig(
              (prev) => ({

                ...prev,

                ...parsedMain

              })
            );

          }

        }


        if (
          gate
        ) {

          const parsedGate =
            JSON.parse(
              gate
            );


          if (
            parsedGate &&
            typeof parsedGate ===
              "object"
          ) {

            setGateConfig(
              (prev) => ({

                ...prev,

                ...parsedGate

              })
            );

          }

        }

      } catch (
        err
      ) {

        console.error(
          "Load server config error:",
          err
        );

      }

    },
    []
  );


  // =====================================================
  // SAVE MAIN SERVER
  // =====================================================

  const saveMainConfig =
    () => {

      localStorage.setItem(
        "mainServer",
        JSON.stringify(
          mainConfig
        )
      );


      alert(
        "Main Server Saved"
      );

    };


  // =====================================================
  // SAVE GATE SERVER
  // =====================================================

  const saveGateConfig =
    () => {

      localStorage.setItem(
        "gateServer",
        JSON.stringify(
          gateConfig
        )
      );


      alert(
        "Gate Server Saved"
      );

    };


  // =====================================================
  // TEST SERVER
  // =====================================================

  const testServer =
    async (
      config,
      setter
    ) => {

      try {

        const url =
          `http://${config.ip}:${config.port}/health`;


        const res =
          await fetch(
            url
          );


        if (
          !res.ok
        ) {

          setter(
            "🔴 Offline"
          );

          return;

        }


        setter(
          "🟢 Online"
        );


      } catch (
        err
      ) {

        console.error(
          "Test server error:",
          err
        );


        setter(
          "🔴 Offline"
        );

      }

    };


  const testMainServer =
    () => {

      testServer(
        mainConfig,
        setMainStatus
      );

    };


  const testGateServer =
    () => {

      testServer(
        gateConfig,
        setGateStatus
      );

    };


  // =====================================================
  // POST DATA
  // =====================================================

  const postData =
    useCallback(
      async (
        url,
        body
      ) => {

        const res =
          await fetch(
            url,
            {

              method:
                "POST",

              headers:
                getAuthHeaders(
                  true
                ),

              body:
                JSON.stringify(
                  body
                )

            }
          );


        let result =
          null;


        try {

          result =
            await res.json();

        } catch (
          err
        ) {

          console.error(
            "POST response parse error:",
            err
          );

        }


        if (
          !res.ok
        ) {

          throw new Error(
            result?.message ||
            url
          );

        }


        return result;

      },
      [
        getAuthHeaders
      ]
    );


  // =====================================================
  // GET DATA
  // =====================================================

  const getData =
    useCallback(
      async (
        url
      ) => {

        const res =
          await fetch(
            url,
            {

              method:
                "GET",

              headers:
                getAuthHeaders()

            }
          );


        let result =
          null;


        try {

          result =
            await res.json();

        } catch (
          err
        ) {

          console.error(
            "GET response parse error:",
            err
          );

        }


        if (
          !res.ok
        ) {

          throw new Error(
            result?.message ||
            url
          );

        }


        return result;

      },
      [
        getAuthHeaders
      ]
    );


  // =====================================================
  // NORMALIZE ARRAY RESPONSE
  // รองรับ:
  // []
  // { data: [] }
  // { users: [] }
  // =====================================================

  const normalizeArray =
    (
      result
    ) => {

      if (
        Array.isArray(
          result
        )
      ) {

        return result;

      }


      if (
        Array.isArray(
          result?.data
        )
      ) {

        return result.data;

      }


      if (
        Array.isArray(
          result?.users
        )
      ) {

        return result.users;

      }


      if (
        Array.isArray(
          result?.items
        )
      ) {

        return result.items;

      }


      return [];

    };


  // =====================================================
  // SYNC NOW
  // =====================================================

  const syncNow =
    useCallback(
      async () => {

        if (
          loading
        ) {

          return;

        }


        if (
          !token
        ) {

          setStatus(
            "Disconnected"
          );

          setProgress(
            "Unauthorized"
          );

          alert(
            "Session expired. Please login again."
          );

          return;

        }


        try {

          setLoading(
            true
          );


          setStatus(
            "Synchronizing..."
          );


          // ---------------------------------------------
          // LOAD INVOICE
          // ---------------------------------------------

          setProgress(
            "Loading Invoice..."
          );


          const invoiceResult =
            await getData(
              `${BASE_API}/invoices`
            );


          const invoices =
            normalizeArray(
              invoiceResult
            );


          // ---------------------------------------------
          // LOAD EXPORT
          // ---------------------------------------------

          setProgress(
            "Loading Export..."
          );


          const exportResult =
            await getData(
              `${BASE_API}/exports`
            );


          const exportsData =
            normalizeArray(
              exportResult
            );


          // ---------------------------------------------
          // LOAD SUPPLIER
          // ---------------------------------------------

          setProgress(
            "Loading Supplier..."
          );


          const supplierResult =
            await getData(
              `${BASE_API}/suppliers`
            );


          const suppliers =
            normalizeArray(
              supplierResult
            );


          // ---------------------------------------------
          // LOAD STOCK
          // ---------------------------------------------

          setProgress(
            "Loading Stock..."
          );


          const stockResult =
            await getData(
              `${BASE_API}/stocks`
            );


          const stocks =
            normalizeArray(
              stockResult
            );


          // ---------------------------------------------
          // SYNC IMPORT
          // ---------------------------------------------

          setProgress(
            "Sync Invoice..."
          );


          await postData(
            `http://${mainConfig.ip}:${mainConfig.port}/sync/imports`,
            invoices
          );


          // ---------------------------------------------
          // SYNC EXPORT
          // ---------------------------------------------

          setProgress(
            "Sync Export..."
          );


          await postData(
            `http://${mainConfig.ip}:${mainConfig.port}/sync/exports`,
            exportsData
          );


          // ---------------------------------------------
          // SYNC SUPPLIER
          // ---------------------------------------------

          setProgress(
            "Sync Supplier..."
          );


          await postData(
            `http://${mainConfig.ip}:${mainConfig.port}/sync/suppliers`,
            suppliers
          );


          // ---------------------------------------------
          // SYNC STOCK
          // ---------------------------------------------

          setProgress(
            "Sync Stock..."
          );


          await postData(
            `http://${mainConfig.ip}:${mainConfig.port}/sync/stocks`,
            stocks
          );


          // ---------------------------------------------
          // SUMMARY
          // ---------------------------------------------

          setSummary({

            invoices:
              invoices.length,

            exports:
              exportsData.length,

            suppliers:
              suppliers.length,

            products:
              stocks.length

          });


          setLastSync(
            new Date()
              .toLocaleString()
          );


          setStatus(
            "Connected"
          );


          setProgress(
            "Completed"
          );


        } catch (
          err
        ) {

          console.error(
            "Sync error:",
            err
          );


          setStatus(
            "Disconnected"
          );


          setProgress(
            err.message ||
            "Failed"
          );


        } finally {

          setLoading(
            false
          );

        }

      },
      [
        BASE_API,
        getData,
        postData,
        loading,
        mainConfig.ip,
        mainConfig.port,
        token
      ]
    );


  // =====================================================
  // DELETE BY DATE
  // =====================================================

  const deleteByDate =
    useCallback(
      async () => {

        if (
          !fromDate ||
          !toDate
        ) {

          alert(
            "Please select date."
          );

          return;

        }


        if (
          !token
        ) {

          alert(
            "Session expired. Please login again."
          );

          return;

        }


        if (
          !deleteImport &&
          !deleteExport
        ) {

          alert(
            "Please select Import or Export."
          );

          return;

        }


        if (
          !deletePassword
        ) {

          alert(
            "Please enter Password."
          );

          return;

        }


        try {

          setLoading(
            true
          );


          const result =
            await postData(
              `${BASE_API}/delete-by-date`,
              {

                fromDate,

                toDate,

                deleteImport,

                deleteExport,

                password:
                  deletePassword

              }
            );


          alert(
            result?.message ||
            "Delete completed"
          );


          setSummary({

            invoices:
              0,

            exports:
              0,

            suppliers:
              0,

            products:
              0

          });


          setLastSync(
            "-"
          );


          setDeletePassword(
            ""
          );


        } catch (
          err
        ) {

          console.error(
            "Delete by date error:",
            err
          );


          alert(
            err.message ||
            "Delete Failed"
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      [
        BASE_API,
        deleteExport,
        deleteImport,
        deletePassword,
        fromDate,
        postData,
        toDate,
        token
      ]
    );


  // =====================================================
  // AUTO SYNC
  // =====================================================

  useEffect(
    () => {

      if (
        !autoSync
      ) {

        return undefined;

      }


      if (
        !token
      ) {

        return undefined;

      }


      const interval =
        Math.max(
          5,
          Number(
            syncInterval
          ) ||
          30
        );


      const timer =
        setInterval(
          () => {

            syncNow();

          },
          interval * 1000
        );


      return () =>
        clearInterval(
          timer
        );

    },
    [
      autoSync,
      syncInterval,
      syncNow,
      token
    ]
  );


  // =====================================================
  // RENDER
  // =====================================================

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


      {/* =================================================
          STATUS
      ================================================= */}

      <div className="summary-grid">

        <div className="summary-card card-blue">

          <h4>
            Status
          </h4>


          <div className="summary-value">

            {
              loading
                ? "Synchronizing..."
                : status
            }

          </div>

        </div>


        <div className="summary-card card-green">

          <h4>
            Progress
          </h4>


          <div className="summary-value">

            {progress}

          </div>

        </div>


        <div className="summary-card card-orange">

          <h4>
            Last Sync
          </h4>


          <div className="summary-value">

            {lastSync}

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN SERVER
      ================================================= */}

      <div className="panel">

        <h3>
          🌐 Main Server
        </h3>


        <div className="supplier-form-grid">

          <input
            placeholder="Server IP"
            value={
              mainConfig.ip
            }
            onChange={
              (e) =>
                setMainConfig(
                  (prev) => ({

                    ...prev,

                    ip:
                      e.target.value

                  })
                )
            }
            disabled={
              loading
            }
          />


          <input
            placeholder="Port"
            value={
              mainConfig.port
            }
            onChange={
              (e) =>
                setMainConfig(
                  (prev) => ({

                    ...prev,

                    port:
                      e.target.value

                  })
                )
            }
            disabled={
              loading
            }
          />

        </div>


        <div className="sync-btn-group">

          <button
            className="sync-btn"
            disabled={
              loading
            }
            onClick={
              testMainServer
            }
          >

            🌐 Test

          </button>


          <button
            className="sync-btn"
            disabled={
              loading
            }
            onClick={
              saveMainConfig
            }
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


      {/* =================================================
          GATE SERVER
      ================================================= */}

      <div className="panel">

        <h3>
          🚛 Gate In-Out Server
        </h3>


        <div className="supplier-form-grid">

          <input
            placeholder="Gate IP"
            value={
              gateConfig.ip
            }
            onChange={
              (e) =>
                setGateConfig(
                  (prev) => ({

                    ...prev,

                    ip:
                      e.target.value

                  })
                )
            }
            disabled={
              loading
            }
          />


          <input
            placeholder="Port"
            value={
              gateConfig.port
            }
            onChange={
              (e) =>
                setGateConfig(
                  (prev) => ({

                    ...prev,

                    port:
                      e.target.value

                  })
                )
            }
            disabled={
              loading
            }
          />

        </div>


        <div className="sync-btn-group">

          <button
            className="sync-btn"
            disabled={
              loading
            }
            onClick={
              testGateServer
            }
          >

            🌐 Test

          </button>


          <button
            className="sync-btn"
            disabled={
              loading
            }
            onClick={
              saveGateConfig
            }
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


      {/* =================================================
          AUTO SYNC
      ================================================= */}

      <div className="panel">

        <h3>
          ⚙️ Auto Sync Setting
        </h3>


        <div className="sync-checkbox-group">

          <label className="sync-checkbox">

            <input
              type="checkbox"
              checked={
                autoSync
              }
              onChange={
                (e) =>
                  setAutoSync(
                    e.target.checked
                  )
              }
              disabled={
                loading
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
          value={
            syncInterval
          }
          onChange={
            (e) =>
              setSyncInterval(
                Number(
                  e.target.value
                )
              )
          }
          disabled={
            loading
          }
        />

      </div>


      {/* =================================================
          MANUAL SYNC
      ================================================= */}

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
            disabled={
              loading
            }
            onClick={
              syncNow
            }
          >

            {
              loading
                ? "⏳ Synchronizing..."
                : "🔄 Sync Now"
            }

          </button>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="dashboard-cards">

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


      {/* =================================================
          DELETE DATA
      ================================================= */}

      <div className="panel">

        <h3>
          🗑 Delete Import / Export Data
        </h3>


        <p className="sync-description">

          Delete data by selected date range

        </p>


        <div className="supplier-form-grid">

          <div>

            <label>
              From Date
            </label>


            <input
              type="date"
              className="form-control"
              value={
                fromDate
              }
              onChange={
                (e) =>
                  setFromDate(
                    e.target.value
                  )
              }
              disabled={
                loading
              }
            />

          </div>


          <div>

            <label>
              To Date
            </label>


            <input
              type="date"
              className="form-control"
              value={
                toDate
              }
              onChange={
                (e) =>
                  setToDate(
                    e.target.value
                  )
              }
              disabled={
                loading
              }
            />

          </div>

        </div>


        <br />


        <label>
          Password
        </label>


        <input
          type="password"
          className="form-control"
          placeholder="Enter Password"
          value={
            deletePassword
          }
          onChange={
            (e) =>
              setDeletePassword(
                e.target.value
              )
          }
          disabled={
            loading
          }
        />


        <br />


        <div className="sync-checkbox-group">

          <label className="sync-checkbox">

            <input
              type="checkbox"
              checked={
                deleteImport
              }
              onChange={
                (e) =>
                  setDeleteImport(
                    e.target.checked
                  )
              }
              disabled={
                loading
              }
            />

            Delete Import

          </label>


          <label className="sync-checkbox">

            <input
              type="checkbox"
              checked={
                deleteExport
              }
              onChange={
                (e) =>
                  setDeleteExport(
                    e.target.checked
                  )
              }
              disabled={
                loading
              }
            />

            Delete Export

          </label>

        </div>


        <button
          className="sync-delete-btn"
          disabled={
            loading
          }
          onClick={
            deleteByDate
          }
        >

          {
            loading
              ? "Deleting..."
              : "🗑 Delete Data"
          }

        </button>

      </div>


      {/* =================================================
          LAST SYNC
      ================================================= */}

      <div className="panel">

        <h3>
          📅 Last Synchronize
        </h3>


        <div className="summary-value">

          {lastSync}

        </div>

      </div>


      {/* =================================================
          PROGRESS
      ================================================= */}

      {loading && (

        <div className="panel">

          <h3>
            ⏳ Synchronizing...
          </h3>


          <div
            style={{
              width:
                "100%",

              height:
                "18px",

              background:
                "#e5e7eb",

              borderRadius:
                "20px",

              overflow:
                "hidden",

              marginTop:
                "10px"
            }}
          >

            <div
              style={{
                width:
                  progress ===
                  "Completed"
                    ? "100%"
                    : "50%",

                height:
                  "100%",

                background:
                  "#16a34a",

                transition:
                  "0.3s"
              }}
            />

          </div>


          <div
            style={{
              textAlign:
                "center",

              marginTop:
                "8px",

              fontWeight:
                "bold"
            }}
          >

            {progress}

          </div>

        </div>

      )}

    </>

  );

}


export default SyncServer;

