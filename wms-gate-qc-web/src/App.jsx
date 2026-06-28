import {
  BrowserRouter,
  Routes,
  Route,
  NavLink
} from 'react-router-dom'

import './App.css'

import Dashboard from './pages/Dashboard'
import GateIn from './pages/GateIn'
import GateOut from './pages/GateOut'
import Stock from './pages/Stock'
import Sync from './pages/Sync'

function App() {

  return (

    <BrowserRouter>

      <div className="layout">

        <div className="sidebar">

          <div className="logo">
            📦 WMS
          </div>

          <div className="menu">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive
                  ? 'menu-link active'
                  : 'menu-link'
              }
            >
              📊 Dashboard
            </NavLink>

            <NavLink
              to="/gate-in"
              className={({ isActive }) =>
                isActive
                  ? 'menu-link active'
                  : 'menu-link'
              }
            >
              🚛 Gate In
            </NavLink>

            <NavLink
              to="/gate-out"
              className={({ isActive }) =>
                isActive
                  ? 'menu-link active'
                  : 'menu-link'
              }
            >
              🚛 Gate Out
            </NavLink>

            <NavLink
              to="/stock"
              className={({ isActive }) =>
                isActive
                  ? 'menu-link active'
                  : 'menu-link'
              }
            >
              📦 Stock
            </NavLink>

            <NavLink
              to="/sync"
              className={({ isActive }) =>
                isActive
                  ? 'menu-link active'
                  : 'menu-link'
              }
            >
              🔄 Sync
            </NavLink>

          </div>

        </div>

        <div className="content">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/gate-in"
              element={<GateIn />}
            />

            <Route
              path="/gate-out"
              element={<GateOut />}
            />

            <Route
              path="/stock"
              element={<Stock />}
            />

            <Route
              path="/sync"
              element={<Sync />}
            />

          </Routes>

        </div>

      </div>

    </BrowserRouter>

  )

}

export default App