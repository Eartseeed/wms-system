import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import ImportInvoice from "./pages/ImportInvoice";
import ExportInvoice from "./pages/ExportInvoice";
import StockManagement from "./pages/StockManagement";
import Supplier from "./pages/Supplier";
import SyncServer from "./pages/SyncServer";
import UserManagement from "./pages/UserManagement";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";

import "./App.css";

function App() {
  const [page, setPage] = useState("dashboard");

  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");

    return userData ? JSON.parse(userData) : null;
  });

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="logo">📦 Invoice System</div>

        <div className="menu-item" onClick={logout}>
          🚪 Logout
        </div>

        <div
          className="menu-item"
          onClick={() => setPage("dashboard")}
        >
          📊 Dashboard
        </div>

        <div
          className="menu-item"
          onClick={() => setPage("import")}
        >
          📥 Import Invoice
        </div>

        <div
          className="menu-item"
          onClick={() => setPage("export")}
        >
          📤 Export Invoice
        </div>

        <div
          className="menu-item"
          onClick={() => setPage("stock")}
        >
          📦 Stock Management
        </div>

        <div
          className="menu-item"
          onClick={() => setPage("supplier")}
        >
          🏪 Supplier
        </div>

        {user?.role === "admin" && (
          <div
            className="menu-item"
            onClick={() => setPage("users")}
          >
            👥 User Management
          </div>
        )}

        {user?.role === "admin" && (
          <div
            className="menu-item"
            onClick={() => setPage("sync")}
          >
            🔄 Sync Main Server
          </div>
        )}
      </div>

      <div className="content">
        {page === "dashboard" && <Dashboard />}

        {page === "import" && <ImportInvoice />}

        {page === "export" && <ExportInvoice />}

        {page === "stock" && <StockManagement />}

        {page === "supplier" && <Supplier />}

        {page === "users" &&
          (user?.role === "admin" ? (
            <UserManagement />
          ) : (
            <Unauthorized />
          ))}

        {page === "sync" &&
          (user?.role === "admin" ? (
            <SyncServer />
          ) : (
            <Unauthorized />
          ))}
      </div>
    </div>
  );
}

export default App;