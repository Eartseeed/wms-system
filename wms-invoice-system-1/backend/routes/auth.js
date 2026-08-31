const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
// =====================================================

const router =
    express.Router();


// =====================================================
// CONTROLLER
//
// Controller นี้รับผิดชอบ:
//
// POST /api/auth/login
// GET  /api/auth/me
// POST /api/auth/logout
// =====================================================

const AuthController =
    require(
        "../controllers/authController"
    );


// =====================================================
// AUTH MIDDLEWARE
//
// authenticate
//
// หน้าที่:
//
// 1. ตรวจ Authorization Header
// 2. ตรวจ Bearer Token
// 3. ตรวจ JWT
// 4. อ่านข้อมูล User จาก Token
// 5. ใส่ข้อมูลลง req.user
//
// ใช้กับ Route:
//
// GET /api/auth/me
// POST /api/auth/logout
//
// ไม่ใช้กับ:
//
// POST /api/auth/login
//
// เพราะ User ยังไม่มี Token ตอน Login
// =====================================================

const {
    authenticate
} =
    require(
        "../middleware/auth"
    );


// =====================================================
// LOGIN
//
// POST /api/auth/login
//
// Public Route
//
// ไม่ต้องมี Token
//
// Request:
//
// {
//     "username": "admin",
//     "password": "123456"
// }
//
// Flow:
//
// Frontend
//     ↓
//
// authController.login
//     ↓
//
// AuthService.login
//     ↓
//
// Database
//     ↓
//
// users.role_id
//     ↓
//
// roles.name
//     ↓
//
// JWT
//     ↓
//
// Return Token + User + Role
//
// Response:
//
// {
//     "success": true,
//     "message": "Login successful",
//     "token": "JWT_TOKEN",
//     "user": {
//         "id": 1,
//         "username": "admin",
//         "fullname": "System Admin",
//         "role": "ADMIN"
//     }
// }
// =====================================================

router.post(
    "/login",
    AuthController.login
);


// =====================================================
// CURRENT USER
//
// GET /api/auth/me
//
// Protected Route
//
// ต้อง Login ก่อน
//
// Header:
//
// Authorization: Bearer JWT_TOKEN
//
// Flow:
//
// Request
//     ↓
//
// authenticate
//     ↓
//
// JWT Verify
//     ↓
//
// req.user
//     ↓
//
// AuthController.me
//
// Response:
//
// {
//     "success": true,
//     "user": {
//         "id": 1,
//         "username": "admin",
//         "fullname": "System Admin",
//         "role": "ADMIN"
//     }
// }
// =====================================================

router.get(
    "/me",
    authenticate,
    AuthController.me
);


// =====================================================
// LOGOUT
//
// POST /api/auth/logout
//
// Protected Route
//
// ต้องมี Token เพื่อยืนยันว่า
// User Login อยู่
//
// หมายเหตุ:
//
// JWT เป็น Stateless
//
// Backend ไม่ได้ลบ Token จาก Database
//
// Frontend จะลบ:
//
// localStorage token
// localStorage user
// localStorage role
// =====================================================

router.post(
    "/logout",
    authenticate,
    AuthController.logout
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports =
    router;