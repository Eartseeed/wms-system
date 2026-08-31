import {
  useState
} from "react";

import Dashboard
  from "./pages/Dashboard";

import ImportInvoice
  from "./pages/ImportInvoice";

import ExportInvoice
  from "./pages/ExportInvoice";

import StockManagement
  from "./pages/StockManagement";

import Supplier
  from "./pages/Supplier";

import SyncServer
  from "./pages/SyncServer";

import UserManagement
  from "./pages/UserManagement";

import Login
  from "./pages/Login";

import Unauthorized
  from "./pages/Unauthorized";

import "./App.css";


// =====================================================
// NORMALIZE ROLE
//
// ทำให้ Role ทั้งระบบมีรูปแบบเดียวกัน
//
// รองรับ:
//
// admin
// ADMIN
// Admin
//
// supervisor
// SUPERVISOR
//
// employee
// EMPLOYEE
//
// ผลลัพธ์สุดท้าย:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

const normalizeRole =
  (role) => {

    const value =
      String(
        role ||
        "EMPLOYEE"
      )
        .trim()
        .toUpperCase();


    // =================================================
    // ADMIN
    // =================================================

    if (
      value === "ADMIN"
    ) {

      return "ADMIN";

    }


    // =================================================
    // SUPERVISOR
    // =================================================

    if (
      value === "SUPERVISOR"
    ) {

      return "SUPERVISOR";

    }


    // =================================================
    // EMPLOYEE
    //
    // ถ้า Role ไม่ใช่ ADMIN หรือ SUPERVISOR
    // ให้ถือเป็น EMPLOYEE
    // =================================================

    return "EMPLOYEE";

  };


// =====================================================
// PAGE PERMISSION
//
// กำหนดสิทธิ์แต่ละหน้า
//
// ADMIN
//
// - Dashboard
// - Import Invoice
// - Export Invoice
// - Stock Management
// - Supplier
// - User Management
// - Sync Main Server
//
// SUPERVISOR
//
// - Dashboard
// - Import Invoice
// - Export Invoice
// - Stock Management
// - Supplier
//
// EMPLOYEE
//
// - Dashboard
// - Import Invoice
// - Export Invoice
// =====================================================

const PAGE_ROLES =
  {

    // =================================================
    // DASHBOARD
    //
    // ทุก Role เข้าดูได้
    // =================================================

    dashboard:
      [
        "ADMIN",
        "SUPERVISOR",
        "EMPLOYEE"
      ],


    // =================================================
    // IMPORT
    // =================================================

    import:
      [
        "ADMIN",
        "SUPERVISOR",
        "EMPLOYEE"
      ],


    // =================================================
    // EXPORT
    // =================================================

    export:
      [
        "ADMIN",
        "SUPERVISOR",
        "EMPLOYEE"
      ],


    // =================================================
    // STOCK
    //
    // EMPLOYEE ไม่มีสิทธิ์
    // =================================================

    stock:
      [
        "ADMIN",
        "SUPERVISOR"
      ],


    // =================================================
    // SUPPLIER
    //
    // EMPLOYEE ไม่มีสิทธิ์
    // =================================================

    supplier:
      [
        "ADMIN",
        "SUPERVISOR"
      ],


    // =================================================
    // USER MANAGEMENT
    //
    // ADMIN เท่านั้น
    // =================================================

    users:
      [
        "ADMIN"
      ],


    // =================================================
    // SYNC MAIN SERVER
    //
    // ADMIN เท่านั้น
    // =================================================

    sync:
      [
        "ADMIN"
      ]

  };


// =====================================================
// CHECK PAGE ACCESS
//
// ใช้ตรวจสอบว่า:
//
// Role นี้
//
// มีสิทธิ์เข้าหน้านี้หรือไม่
//
// ตัวอย่าง:
//
// canAccess(
//   "users",
//   "ADMIN"
// )
//
// จะได้ true
//
// canAccess(
//   "users",
//   "EMPLOYEE"
// )
//
// จะได้ false
// =====================================================

const canAccess =
  (
    page,
    role
  ) => {

    const allowedRoles =
      PAGE_ROLES[
        page
      ] ||
      [];


    const normalizedRole =
      normalizeRole(
        role
      );


    return allowedRoles.includes(
      normalizedRole
    );

  };


// =====================================================
// GET SAVED USER
//
// อ่าน User จาก localStorage
//
// สำคัญ:
//
// Login ใหม่จะบันทึก:
//
// token
// user
// role
//
// แต่ข้อมูล User เก่าบางเครื่อง
// อาจมี user.role เป็นตัวพิมพ์เล็ก
//
// ฟังก์ชันนี้จะ Normalize ให้ทุกครั้ง
// =====================================================

const getSavedUser =
  () => {

    try {

      const userData =
        localStorage.getItem(
          "user"
        );


      // ===============================================
      // ถ้าไม่มี User
      // ยังไม่ได้ Login
      // ===============================================

      if (
        !userData
      ) {

        return null;

      }


      const savedUser =
        JSON.parse(
          userData
        );


      // ===============================================
      // อ่าน Role
      //
      // ลำดับ:
      //
      // 1. user.role
      // 2. localStorage role
      // ===============================================

      const savedRole =
        localStorage.getItem(
          "role"
        );


      const role =
        normalizeRole(
          savedUser?.role ||
          savedRole
        );


      // ===============================================
      // สร้าง User ใหม่
      // พร้อม Role ที่ Normalize แล้ว
      // ===============================================

      const normalizedUser =
        {

          ...savedUser,

          role

        };


      // ===============================================
      // บันทึกกลับ
      //
      // เพื่อแก้ข้อมูล Role เก่า
      // ===============================================

      localStorage.setItem(
        "user",
        JSON.stringify(
          normalizedUser
        )
      );


      localStorage.setItem(
        "role",
        role
      );


      return normalizedUser;


    } catch (
      err
    ) {

      console.error(
        "Cannot read saved user:",
        err
      );


      // ===============================================
      // ถ้าข้อมูล User เสีย
      // ให้ล้าง Login เก่า
      // ===============================================

      localStorage.removeItem(
        "token"
      );


      localStorage.removeItem(
        "user"
      );


      localStorage.removeItem(
        "role"
      );


      return null;

    }

  };


// =====================================================
// APP
// =====================================================

function App() {


  // =====================================================
  // CURRENT PAGE
  //
  // หน้าเริ่มต้นหลัง Login
  //
  // ทุก Role เข้า Dashboard ได้
  // =====================================================

  const [
    page,
    setPage
  ] =
    useState(
      "dashboard"
    );


  // =====================================================
  // CURRENT USER
  //
  // อ่านจาก localStorage ตอนเปิดโปรแกรม
  // =====================================================

  const [
    user,
    setUser
  ] =
    useState(
      getSavedUser
    );


  // =====================================================
  // CURRENT ROLE
  //
  // ใช้ user.role เป็นหลัก
  //
  // ถ้าไม่มี:
  //
  // ใช้ localStorage role
  //
  // ถ้ายังไม่มี:
  //
  // normalizeRole จะให้เป็น EMPLOYEE
  // =====================================================

  const role =
    normalizeRole(
      user?.role ||
      localStorage.getItem(
        "role"
      )
    );


  // =====================================================
  // LOGIN SUCCESS
  //
  // Login.jsx จะส่ง loginUser กลับมา
  //
  // ข้อมูลที่ได้:
  //
  // {
  //   id,
  //   username,
  //   fullname,
  //   role
  // }
  //
  // จากนั้น App จะ:
  //
  // 1. Normalize Role
  // 2. บันทึก User
  // 3. บันทึก Role
  // 4. setUser
  // 5. เข้า Dashboard
  // =====================================================

  const handleLogin =
    (
      loginUser
    ) => {

      const normalizedRole =
        normalizeRole(
          loginUser?.role ||
          localStorage.getItem(
            "role"
          )
        );


      const normalizedUser =
        {

          ...loginUser,

          role:
            normalizedRole

        };


      // =================================================
      // SAVE USER
      // =================================================

      localStorage.setItem(
        "user",
        JSON.stringify(
          normalizedUser
        )
      );


      // =================================================
      // SAVE ROLE
      // =================================================

      localStorage.setItem(
        "role",
        normalizedRole
      );


      // =================================================
      // GO DASHBOARD
      //
      // Dashboard ทุก Role เข้าได้
      // =================================================

      setPage(
        "dashboard"
      );


      // =================================================
      // UPDATE CURRENT USER
      //
      // จุดนี้ทำให้ Sidebar
      // เปลี่ยนเมนูตาม Role ทันที
      // =================================================

      setUser(
        normalizedUser
      );

    };


  // =====================================================
  // LOGOUT
  //
  // ล้างข้อมูล Login ทั้งหมด
  // =====================================================

  const logout =
    () => {

      // =================================================
      // TOKEN
      // =================================================

      localStorage.removeItem(
        "token"
      );


      // =================================================
      // USER
      // =================================================

      localStorage.removeItem(
        "user"
      );


      // =================================================
      // ROLE
      // =================================================

      localStorage.removeItem(
        "role"
      );


      // =================================================
      // RESET PAGE
      // =================================================

      setPage(
        "dashboard"
      );


      // =================================================
      // CLEAR USER
      //
      // หลัง setUser(null)
      // App จะกลับไปหน้า Login
      // =================================================

      setUser(
        null
      );

    };


  // =====================================================
  // CHANGE PAGE
  //
  // ตรวจสอบสิทธิ์ก่อนเปลี่ยนหน้า
  //
  // แม้ Menu จะซ่อนแล้ว
  // ก็ตรวจซ้ำอีกครั้ง
  // =====================================================

  const changePage =
    (
      nextPage
    ) => {

      // =================================================
      // CHECK ACCESS
      // =================================================

      if (
        !canAccess(
          nextPage,
          role
        )
      ) {

        alert(
          "You do not have permission to access this page"
        );


        return;

      }


      // =================================================
      // CHANGE PAGE
      // =================================================

      setPage(
        nextPage
      );

    };


  // =====================================================
  // LOGIN PAGE
  //
  // ถ้ายังไม่มี User
  // แสดงหน้า Login
  // =====================================================

  if (
    !user
  ) {

    return (

      <Login
        onLogin={
          handleLogin
        }
      />

    );

  }


  // =====================================================
  // RENDER PAGE
  // =====================================================

  const renderPage =
    () => {

      // ===============================================
      // CHECK PERMISSION AGAIN
      //
      // ป้องกันการเข้าหน้าที่ไม่มีสิทธิ์
      // ===============================================

      if (
        !canAccess(
          page,
          role
        )
      ) {

        return (

          <Unauthorized />

        );

      }


      // ===============================================
      // DASHBOARD
      // ===============================================

      if (
        page === "dashboard"
      ) {

        return (

          <Dashboard />

        );

      }


      // ===============================================
      // IMPORT INVOICE
      // ===============================================

      if (
        page === "import"
      ) {

        return (

          <ImportInvoice />

        );

      }


      // ===============================================
      // EXPORT INVOICE
      // ===============================================

      if (
        page === "export"
      ) {

        return (

          <ExportInvoice />

        );

      }


      // ===============================================
      // STOCK MANAGEMENT
      // ===============================================

      if (
        page === "stock"
      ) {

        return (

          <StockManagement />

        );

      }


      // ===============================================
      // SUPPLIER
      // ===============================================

      if (
        page === "supplier"
      ) {

        return (

          <Supplier />

        );

      }


      // ===============================================
      // USER MANAGEMENT
      // ===============================================

      if (
        page === "users"
      ) {

        return (

          <UserManagement />

        );

      }


      // ===============================================
      // SYNC SERVER
      // ===============================================

      if (
        page === "sync"
      ) {

        return (

          <SyncServer />

        );

      }


      // ===============================================
      // DEFAULT
      //
      // ถ้าไม่พบ Page
      // กลับ Dashboard
      // ===============================================

      return (

        <Dashboard />

      );

    };


  // =====================================================
  // MENU ITEMS
  //
  // Menu ทุกตัวอยู่ที่นี่
  //
  // การแสดงผลจะใช้:
  //
  // canAccess(item.key, role)
  //
  // =====================================================

  const menuItems =
    [

      // =================================================
      // DASHBOARD
      // =================================================

      {

        key:
          "dashboard",

        label:
          "📊 Dashboard"

      },


      // =================================================
      // IMPORT INVOICE
      // =================================================

      {

        key:
          "import",

        label:
          "📥 Import Invoice"

      },


      // =================================================
      // EXPORT INVOICE
      // =================================================

      {

        key:
          "export",

        label:
          "📤 Export Invoice"

      },


      // =================================================
      // STOCK MANAGEMENT
      //
      // ADMIN
      // SUPERVISOR
      // =================================================

      {

        key:
          "stock",

        label:
          "📦 Stock Management"

      },


      // =================================================
      // SUPPLIER
      //
      // ADMIN
      // SUPERVISOR
      // =================================================

      {

        key:
          "supplier",

        label:
          "🏪 Supplier"

      },


      // =================================================
      // USER MANAGEMENT
      //
      // ADMIN ONLY
      // =================================================

      {

        key:
          "users",

        label:
          "👥 User Management"

      },


      // =================================================
      // SYNC MAIN SERVER
      //
      // ADMIN ONLY
      // =================================================

      {

        key:
          "sync",

        label:
          "🔄 Sync Main Server"

      }

    ];


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="app-layout">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div className="sidebar">


        {/* =================================================
            SYSTEM LOGO
        ================================================= */}

        <div className="logo">

          📦 Invoice System

        </div>


        {/* =================================================
            USER INFORMATION
        ================================================= */}

        <div
          style={{
            padding:
              "12px",

            marginBottom:
              "10px",

            borderBottom:
              "1px solid rgba(255,255,255,0.2)"
          }}
        >

          {/* USER NAME */}

          <div
            style={{
              fontWeight:
                "bold"
            }}
          >

            {
              user?.fullname ||
              user?.full_name ||
              user?.name ||
              user?.username ||
              "-"
            }

          </div>


          {/* USERNAME */}

          {
            user?.username && (

              <div
                style={{
                  fontSize:
                    "12px",

                  marginTop:
                    "4px",

                  opacity:
                    0.7
                }}
              >

                Username:
                {" "}
                {user.username}

              </div>

            )
          }


          {/* ROLE */}

          <div
            style={{
              fontSize:
                "12px",

              marginTop:
                "4px",

              opacity:
                0.8
            }}
          >

            Role:
            {" "}
            {role}

          </div>

        </div>


        {/* =================================================
            MENU
        ================================================= */}

        {
          menuItems

            .filter(
              (item) =>

                canAccess(
                  item.key,
                  role
                )
            )

            .map(
              (item) => (

                <div
                  key={
                    item.key
                  }
                  className={
                    `menu-item ${
                      page === item.key
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    changePage(
                      item.key
                    )
                  }
                >

                  {
                    item.label
                  }

                </div>

              )
            )
        }


        {/* =================================================
            LOGOUT
        ================================================= */}

        <div
          className="menu-item"
          onClick={
            logout
          }
          style={{
            marginTop:
              "20px"
          }}
        >

          🚪 Logout

        </div>


      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="content">

        {
          renderPage()
        }

      </div>


    </div>

  );

}


export default App;