const express =
    require(
        "express"
    );


// =========================================================
// STOCK ROUTER
//
// Route หลัก:
//
// /api/stock
//
// Controller:
//
// backend/controllers/stockController.js
//
// Service:
//
// backend/services/stockService.js
//
// =========================================================
//
// STOCK FLOW หลัก:
//
// IMPORT
// ↓
// ImportService
// ↓
// StockService.receive()
// ↓
// STOCK + STOCK MOVEMENT
//
// EXPORT
// ↓
// ExportService
// ↓
// StockService.issue()
// ↓
// STOCK + STOCK MOVEMENT
//
// =========================================================
//
// Route นี้รองรับ:
//
// GET
// /api/stock
//
// GET
// /api/stock/product/:productCode
//
// POST
// /api/stock
//
// POST
// /api/stock/receive
//
// POST
// /api/stock/issue
//
// =========================================================


const router =
    express.Router();


// =========================================================
// STOCK CONTROLLER
//
// Controller รับ Request จาก Route นี้
//
// และเรียก:
//
// StockService
//
// เพื่อจัดการ Stock
// =========================================================

const StockController =
    require(
        "../controllers/stockController"
    );


// =========================================================
// AUTH MIDDLEWARE
//
// authenticate
//
// ตรวจสอบ:
//
// - User Login หรือไม่
// - Authorization Header
// - Bearer Token
// - JWT Token
//
// ถ้าผ่าน:
//
// req.user = {
//     id,
//     username,
//     fullname,
//     role
// }
//
// =========================================================
//
// authorize
//
// ตรวจสอบ Role
//
// เช่น:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// =========================================================

const {
    authenticate,
    authorize
} =
    require(
        "../middleware/auth"
    );


// =========================================================
// ROLE POLICY
//
// รวมสิทธิ์ของ Stock API ไว้ในที่เดียว
//
// เพื่อไม่ต้องเขียน Role ซ้ำทุก Route
//
// =========================================================
//
// ALL
//
// User ทุก Role:
//
// - ADMIN
// - SUPERVISOR
// - EMPLOYEE
//
// =========================================================
//
// STOCK_MANAGER
//
// ผู้มีสิทธิ์จัดการ Stock:
//
// - ADMIN
// - SUPERVISOR
//
// =========================================================
//
// ADMIN
//
// ADMIN เท่านั้น
//
// =========================================================

const ROLE =
    {

        // -------------------------------------------------
        // ทุก Role ที่ Login แล้ว
        // -------------------------------------------------

        ALL:
            [
                "ADMIN",
                "SUPERVISOR",
                "EMPLOYEE"
            ],


        // -------------------------------------------------
        // ผู้จัดการ Stock
        //
        // สามารถ:
        //
        // - ดู Stock
        // - Create Opening Stock
        // - Receive Manual Stock
        // - Issue Manual Stock
        //
        // -------------------------------------------------

        STOCK_MANAGER:
            [
                "ADMIN",
                "SUPERVISOR"
            ],


        // -------------------------------------------------
        // ADMIN เท่านั้น
        // -------------------------------------------------

        ADMIN:
            [
                "ADMIN"
            ]

    };


// =========================================================
// ALL STOCK ROUTES REQUIRE LOGIN
//
// Middleware นี้จะทำงานก่อนทุก Route
//
// ถ้า:
//
// ไม่มี Token
//
// หรือ:
//
// Token ไม่ถูกต้อง
//
// ระบบจะตอบ:
//
// 401 Unauthorized
//
// =========================================================

router.use(
    authenticate
);


// =========================================================
// GET ALL STOCK
//
// GET:
//
// /api/stock
//
// =========================================================
//
// สิทธิ์:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// =========================================================
//
// ใช้สำหรับ:
//
// - Stock Management Page
// - Dashboard
// - Export Page
// - ตรวจสอบจำนวน Stock
//
// =========================================================

router.get(

    "/",

    authorize(
        ...ROLE.ALL
    ),

    StockController.getAll

);


// =========================================================
// GET STOCK BY PRODUCT
//
// GET:
//
// /api/stock/product/:productCode
//
// =========================================================
//
// ตัวอย่าง:
//
// /api/stock/product/10001
//
// =========================================================
//
// สิทธิ์:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// =========================================================
//
// ใช้สำหรับ:
//
// - ค้นหา Stock ตาม Product Number
// - ตรวจสอบ Stock ก่อน Export
// - ตรวจสอบสินค้าในคลัง
//
// =========================================================
//
// IMPORTANT
//
// Route นี้ต้องอยู่ก่อน:
//
// /:id
//
// หากในอนาคตมี:
//
// GET /api/stock/:id
//
// =========================================================

router.get(

    "/product/:productCode",

    authorize(
        ...ROLE.ALL
    ),

    StockController.getByProduct

);


// =========================================================
// CREATE STOCK
//
// POST:
//
// /api/stock
//
// =========================================================
//
// ใช้สำหรับ:
//
// - Opening Stock
// - Initial Stock
// - Admin Create Stock
//
// =========================================================
//
// ไม่ใช่ Flow หลักของ Import
//
// Import Flow หลัก:
//
// Import Invoice
// ↓
// ImportService
// ↓
// StockService.receive()
//
// =========================================================
//
// สิทธิ์:
//
// ADMIN
// SUPERVISOR
//
// EMPLOYEE ไม่มีสิทธิ์สร้าง Stock โดยตรง
//
// =========================================================

router.post(

    "/",

    authorize(
        ...ROLE.STOCK_MANAGER
    ),

    StockController.create

);


// =========================================================
// MANUAL RECEIVE STOCK
//
// POST:
//
// /api/stock/receive
//
// =========================================================
//
// ใช้สำหรับ:
//
// - Manual Receive
// - Opening Adjustment
// - Internal Receive
//
// =========================================================
//
// Flow:
//
// Request
// ↓
// StockController.receive()
// ↓
// StockService.receive()
// ↓
// Update Stock
// +
// Create Movement
//
// =========================================================
//
// สิทธิ์:
//
// ADMIN
// SUPERVISOR
//
// =========================================================
//
// EMPLOYEE ไม่มีสิทธิ์
//
// เพราะการเพิ่ม Stock โดยตรง
// อาจส่งผลต่อ:
//
// - Stock Balance
// - Stock Value
// - Dashboard
// - Report
//
// =========================================================

router.post(

    "/receive",

    authorize(
        ...ROLE.STOCK_MANAGER
    ),

    StockController.receive

);


// =========================================================
// MANUAL ISSUE STOCK
//
// POST:
//
// /api/stock/issue
//
// =========================================================
//
// ใช้สำหรับ:
//
// - Manual Issue
// - Internal Issue
// - Stock Adjustment
//
// =========================================================
//
// Export Flow หลัก:
//
// Export Invoice
// ↓
// ExportService
// ↓
// StockService.issue()
//
// =========================================================
//
// Flow:
//
// Request
// ↓
// StockController.issue()
// ↓
// StockService.issue()
// ↓
// ตรวจสอบ Stock
// ↓
// Stock เพียงพอหรือไม่
// ↓
// ลด Stock
// +
// Create Movement
//
// =========================================================
//
// สิทธิ์:
//
// ADMIN
// SUPERVISOR
//
// =========================================================

router.post(

    "/issue",

    authorize(
        ...ROLE.STOCK_MANAGER
    ),

    StockController.issue

);


// =========================================================
// ROUTE NOT FOUND
//
// ใช้เฉพาะ Request ที่เข้ามา:
//
// /api/stock/...
//
// แต่ไม่ตรงกับ Route ด้านบน
//
// ตัวอย่าง:
//
// GET
// /api/stock/unknown
//
// =========================================================
//
// Response:
//
// 404
//
// {
//     success: false,
//     message: "Stock API route not found"
// }
//
// =========================================================

router.use(

    (
        req,
        res
    ) => {

        return res
            .status(
                404
            )
            .json({

                success:
                    false,


                message:
                    "Stock API route not found",


                path:
                    req.originalUrl


            });

    }

);


// =========================================================
// EXPORT ROUTER
//
// server.js ใช้งาน:
//
// const stockRoutes =
//     require("./routes/stock");
//
// app.use(
//     "/api/stock",
//     stockRoutes
// );
//
// =========================================================

module.exports =
    router;