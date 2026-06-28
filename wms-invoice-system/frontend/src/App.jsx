import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import ImportInvoice from "./pages/ImportInvoice";
import ExportInvoice from "./pages/ExportInvoice";
import StockManagement from "./pages/StockManagement";
import Supplier from "./pages/Supplier";
import SyncServer from "./pages/SyncServer";

import "./App.css";

function App() {

  const [page, setPage] =
    useState("dashboard");

  return (

    <div className="app-layout">

      <div className="sidebar">

        <div className="logo">
          📦 Invoice System
        </div>

        <div
          className="menu-item"
          onClick={() =>
            setPage("dashboard")
          }
        >
          📊 Dashboard
        </div>

        <div
          className="menu-item"
          onClick={() =>
            setPage("import")
          }
        >
          📥 Import Invoice
        </div>

        <div
          className="menu-item"
          onClick={() =>
            setPage("export")
          }
        >
          📤 Export Invoice
        </div>

        <div
          className="menu-item"
          onClick={() =>
            setPage("stock")
          }
        >
          📦 Stock Management
        </div>

        <div
          className="menu-item"
          onClick={() =>
            setPage("supplier")
          }
        >
          🏪 Supplier
        </div>

        <div
          className="menu-item"
          onClick={() =>
            setPage("sync")
          }
        >
          🔄 Sync Main Server
        </div>

      </div>

      <div className="content">

        {page === "dashboard" &&
          <Dashboard />
        }

        {page === "import" &&
          <ImportInvoice />
        }

        {page === "export" &&
          <ExportInvoice />
        }

        {page === "stock" &&
          <StockManagement />
        }

        {page === "supplier" &&
          <Supplier />
        }

        {page === "sync" &&
          <SyncServer />
        }

      </div>

    </div>

  );

}

export default App;