import {
  useState
} from "react";

import axios
  from "axios";

import {
  API
} from "../config/api";


// =====================================================
// NORMALIZE ROLE
//
// Backend ส่ง:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// แต่รองรับข้อมูลเก่าด้วย:
//
// admin
// supervisor
// employee
//
// เพื่อให้ Role ทั้งระบบใช้รูปแบบเดียวกัน
// =====================================================

const normalizeRole =
  (role) => {

    const value =
      String(
        role || "EMPLOYEE"
      )
        .trim()
        .toUpperCase();


    if (
      value === "ADMIN"
    ) {

      return "ADMIN";

    }


    if (
      value === "SUPERVISOR"
    ) {

      return "SUPERVISOR";

    }


    return "EMPLOYEE";

  };


// =====================================================
// LOGIN
// =====================================================

function Login({
  onLogin
}) {


  // =====================================================
  // STATE
  // =====================================================

  const [
    username,
    setUsername
  ] =
    useState(
      ""
    );


  const [
    password,
    setPassword
  ] =
    useState(
      ""
    );


  const [
    loading,
    setLoading
  ] =
    useState(
      false
    );


  // =====================================================
  // LOGIN
  //
  // Flow:
  //
  // Username + Password
  //          ↓
  // POST /api/auth/login
  //          ↓
  // Backend ตรวจ User
  //          ↓
  // Backend JOIN Role
  //          ↓
  // JWT Token
  //          ↓
  // data.user.role
  //          ↓
  // Save localStorage
  //          ↓
  // App.jsx แสดงเมนูตาม Role
  // =====================================================

  const login =
    async () => {

      if (
        loading
      ) {

        return;

      }


      const loginUsername =
        String(
          username || ""
        )
          .trim();


      const loginPassword =
        String(
          password || ""
        );


      // =================================================
      // VALIDATE USERNAME
      // =================================================

      if (
        !loginUsername
      ) {

        alert(
          "Please enter Username"
        );

        return;

      }


      // =================================================
      // VALIDATE PASSWORD
      // =================================================

      if (
        !loginPassword
      ) {

        alert(
          "Please enter Password"
        );

        return;

      }


      try {

        setLoading(
          true
        );


        // =================================================
        // CALL LOGIN API
        // =================================================

        const response =
          await axios.post(
            `${API}/auth/login`,
            {

              username:
                loginUsername,

              password:
                loginPassword

            }
          );


        const data =
          response.data;


        // =================================================
        // CHECK SUCCESS
        // =================================================

        if (
          !data?.success
        ) {

          alert(
            data?.message ||
            "Login Failed"
          );

          return;

        }


        // =================================================
        // GET TOKEN
        // =================================================

        const token =
          String(
            data?.token || ""
          );


        if (
          !token
        ) {

          alert(
            "Login Failed: Token not found"
          );

          return;

        }


        // =================================================
        // GET USER DATA
        // =================================================

        const responseUser =
          data?.user || {};


        // =================================================
        // GET ROLE
        //
        // Priority:
        //
        // 1. data.user.role
        // 2. data.role
        //
        // แล้ว Normalize เป็น:
        //
        // ADMIN
        // SUPERVISOR
        // EMPLOYEE
        //
        // เพื่อให้ตรงกับ:
        //
        // App.jsx
        // middleware/auth.js
        // UserManagement.jsx
        // =================================================

        const role =
          normalizeRole(
            responseUser.role ||
            data.role ||
            "EMPLOYEE"
          );


        // =================================================
        // CREATE LOGIN USER
        //
        // ใช้ข้อมูลนี้ทั้ง:
        //
        // localStorage
        //
        // และ:
        //
        // App.jsx
        // =================================================

        const loginUser =
          {

            id:
              responseUser.id,

            username:
              responseUser.username ||
              loginUsername,

            fullname:
              responseUser.fullname ||
              responseUser.full_name ||
              responseUser.name ||
              "",

            full_name:
              responseUser.full_name ||
              responseUser.fullname ||
              responseUser.name ||
              "",

            name:
              responseUser.name ||
              responseUser.fullname ||
              responseUser.full_name ||
              "",

            role:
              role,

            role_id:
              responseUser.role_id ??
              null,

            email:
              responseUser.email ||
              "",

            phone:
              responseUser.phone ||
              ""

          };


        // =================================================
        // SAVE TOKEN
        //
        // API อื่นใช้:
        //
        // Authorization:
        // Bearer TOKEN
        // =================================================

        localStorage.setItem(
          "token",
          token
        );


        // =================================================
        // SAVE USER
        //
        // สำคัญ:
        //
        // role ที่บันทึกตรงนี้คือ
        // ADMIN / SUPERVISOR / EMPLOYEE
        // =================================================

        localStorage.setItem(
          "user",
          JSON.stringify(
            loginUser
          )
        );


        // =================================================
        // SAVE ROLE
        //
        // เก็บแยกไว้เพื่อรองรับระบบเดิม
        // =================================================

        localStorage.setItem(
          "role",
          role
        );


        // =================================================
        // LOGIN SUCCESS
        //
        // ส่ง User กลับ App.jsx
        //
        // App.jsx จะ:
        //
        // 1. setUser()
        // 2. ตรวจ Role
        // 3. แสดงเมนูตามสิทธิ์
        // =================================================

        if (
          onLogin
        ) {

          onLogin(
            loginUser
          );

        }

      } catch (
        err
      ) {

        console.error(
          "Login error:",
          err
        );


        const message =
          err.response?.data?.message ||
          err.message ||
          "Cannot connect to server";


        alert(
          message
        );

      } finally {

        setLoading(
          false
        );

      }

    };


  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown =
    (e) => {

      if (
        e.key === "Enter"
      ) {

        login();

      }

    };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="login-page">

      <div className="login-box">

        <h2>
          Invoice System
        </h2>


        <input
          type="text"
          placeholder="Username"
          autoComplete="username"
          value={
            username
          }
          onChange={
            (e) =>
              setUsername(
                e.target.value
              )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={
            loading
          }
        />


        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={
            password
          }
          onChange={
            (e) =>
              setPassword(
                e.target.value
              )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={
            loading
          }
        />


        <button
          type="button"
          onClick={
            login
          }
          disabled={
            loading
          }
        >

          {
            loading
              ? "Loading..."
              : "Login"
          }

        </button>

      </div>

    </div>

  );

}


export default Login;