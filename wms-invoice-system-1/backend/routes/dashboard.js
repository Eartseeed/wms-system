const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
//
// Route หลัก:
//
// /api/dashboard
//
// =====================================================

const router =
    express.Router();


// =====================================================
// DASHBOARD CONTROLLER
//
// Controller รับผิดชอบ:
//
// - Dashboard Summary
// - Recent Import
// - Recent Export
// - Import Pagination
// - Export Pagination
//
// IMPORTANT
//
// Route นี้ไม่แก้ไขข้อมูล Stock โดยตรง
//
// มีหน้าที่:
//
// - อ่านข้อมูล
// - สรุปข้อมูล
// - ส่งข้อมูลให้ Dashboard
//
// =====================================================

const DashboardController =
    require(
        "../controllers/dashboardController"
    );


// =====================================================
// AUTH MIDDLEWARE
//
// authenticate
//
// ตรวจสอบ:
//
// - Authorization Header
// - Bearer Token
// - JWT Token
//
// authorize
//
// ตรวจสอบสิทธิ์ตาม Role
//
// =====================================================

const {
    authenticate,
    authorize
} =
    require(
        "../middleware/auth"
    );


// =====================================================
// ROLE POLICY
//
// Dashboard เป็นหน้าสำหรับดูภาพรวมระบบ
//
// ดังนั้น:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// สามารถดูข้อมูลได้ทั้งหมด
//
// IMPORTANT
//
// Route นี้ไม่มี:
//
// POST
// PUT
// DELETE
//
// จึงไม่มีการแก้ไขข้อมูลโดยตรง
//
// =====================================================

const ROLE =
    {

        VIEW:
            [

                "ADMIN",

                "SUPERVISOR",

                "EMPLOYEE"

            ]

    };


// =====================================================
// ALL DASHBOARD ROUTES REQUIRE LOGIN
//
// ทุก API ของ Dashboard
// ต้อง Login ก่อน
//
// ถ้า:
//
// - ไม่มี Token
// - Token ไม่ถูกต้อง
// - Token หมดอายุ
//
// จะตอบ:
//
// 401 Unauthorized
//
// =====================================================

router.use(
    authenticate
);


// =====================================================
// DASHBOARD SUMMARY
//
// GET:
//
// /api/dashboard
//
// =====================================================
//
// Frontend เรียก:
//
// GET /api/dashboard
//
// หรือ:
//
// GET /api/dashboard?dateFrom=2026-08-01&dateTo=2026-08-31
//
// =====================================================
//
// ใช้แสดง:
//
// - Total Import
// - Total Export
// - Total Stock
// - Stock Value
// - หรือข้อมูล Summary อื่น
//
// Controller เป็นผู้จัดการ Logic
//
// =====================================================

router.get(

    "/",

    authorize(
        ...ROLE.VIEW
    ),

    DashboardController.getSummary

);


// =====================================================
// RECENT IMPORT
//
// GET:
//
// /api/dashboard/recent-import
//
// =====================================================
//
// Frontend รองรับ:
//
// page
// dateFrom
// dateTo
//
// ตัวอย่าง:
//
// /api/dashboard/recent-import?page=1
//
// /api/dashboard/recent-import?
// page=1&dateFrom=2026-08-01&dateTo=2026-08-31
//
// =====================================================
//
// IMPORTANT
//
// Route นี้ต้องอยู่ก่อน:
//
// /:id
//
// แม้ปัจจุบัน Dashboard ไม่มี /:id
// แต่การวาง Static Route ก่อน Dynamic Route
// จะปลอดภัยกว่า
//
// =====================================================

router.get(

    "/recent-import",

    authorize(
        ...ROLE.VIEW
    ),

    DashboardController.getRecentImport

);


// =====================================================
// RECENT EXPORT
//
// GET:
//
// /api/dashboard/recent-export
//
// =====================================================
//
// Frontend รองรับ:
//
// page
// dateFrom
// dateTo
//
// ตัวอย่าง:
//
// /api/dashboard/recent-export?page=1
//
// /api/dashboard/recent-export?
// page=1&dateFrom=2026-08-01&dateTo=2026-08-31
//
// =====================================================

router.get(

    "/recent-export",

    authorize(
        ...ROLE.VIEW
    ),

    DashboardController.getRecentExport

);


// =====================================================
// IMPORT PAGES
//
// GET:
//
// /api/dashboard/import-pages
//
// =====================================================
//
// หน้าที่:
//
// ส่งจำนวนหน้าของ Recent Import
//
// Frontend ใช้:
//
// importPages
//
// ตัวอย่าง Response:
//
// {
//     success: true,
//
//     data: {
//         pages: 5
//     }
// }
//
// หรือ:
//
// {
//     pages: 5
// }
//
// =====================================================
//
// Frontend รองรับทั้ง:
//
// data.pages
//
// และ:
//
// pages
//
// =====================================================

router.get(

    "/import-pages",

    authorize(
        ...ROLE.VIEW
    ),

    DashboardController.getImportPages

);


// =====================================================
// EXPORT PAGES
//
// GET:
//
// /api/dashboard/export-pages
//
// =====================================================
//
// หน้าที่:
//
// ส่งจำนวนหน้าของ Recent Export
//
// Frontend ใช้:
//
// exportPages
//
// =====================================================
//
// ตัวอย่าง:
//
// /api/dashboard/export-pages?
// dateFrom=2026-08-01&dateTo=2026-08-31
//
// =====================================================

router.get(

    "/export-pages",

    authorize(
        ...ROLE.VIEW
    ),

    DashboardController.getExportPages

);


// =====================================================
// OPTIONAL ALIAS:
//
// /summary
//
// =====================================================
//
// ใช้สำหรับรองรับ API ที่อาจเรียก:
//
// /api/dashboard/summary
//
// แทน:
//
// /api/dashboard
//
// ส่งไป Controller เดียวกัน
//
// ไม่กระทบ Flow เดิม
//
// =====================================================

router.get(

    "/summary",

    authorize(
        ...ROLE.VIEW
    ),

    DashboardController.getSummary

);


// =====================================================
// ROUTE NOT FOUND
//
// ถ้า Request เข้ามาที่:
//
// /api/dashboard/...
//
// แต่ไม่ตรงกับ Route ที่กำหนด
//
// จะตอบ:
//
// 404
//
// =====================================================

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
                    "Dashboard API route not found",

                path:
                    req.originalUrl

            });

    }

);


// =====================================================
// EXPORT ROUTER
//
// server.js:
//
// const dashboardRoutes =
//     require("./routes/dashboard");
//
// app.use(
//     "/api/dashboard",
//     dashboardRoutes
// );
//
// =====================================================

module.exports =
    router;