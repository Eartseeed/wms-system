const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
//
// Route นี้ถูกใช้งานผ่าน:
//
// /api/reports
// =====================================================

const router =
    express.Router();


// =====================================================
// REPORT CONTROLLER
//
// Controller เดิมของระบบ
//
// รับผิดชอบ:
//
// - Stock Report
// - Movement Report
// - Import Report
// - Export Report
// - Supplier Report
// - Summary Report
// - Inventory Value
//
// Controller เป็นผู้จัดการ:
//
// - Query Date Range
// - JSON Response
// - Excel Export
//
// Route นี้มีหน้าที่หลัก:
//
// - ตรวจสอบ Login
// - ตรวจสอบ Role
// - ส่ง Request ไปยัง Controller
// =====================================================

const ReportController =
    require(
        "../controllers/reportController"
    );


// =====================================================
// AUTH MIDDLEWARE
//
// authenticate
//
//     ตรวจสอบ:
//
//     - Authorization Header
//     - Bearer Token
//     - JWT
//
// authorize
//
//     ตรวจสอบ Role
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
// REPORT เป็นข้อมูลสำหรับดูและวิเคราะห์
//
// ดังนั้น:
//
// ADMIN
//     ดู Report + Export Excel
//
// SUPERVISOR
//     ดู Report + Export Excel
//
// EMPLOYEE
//     ดู Report + Export Excel
//
// ไม่มี Route สำหรับ:
//
// - แก้ไข Report
// - ลบ Report
//
// IMPORTANT:
//
// รายงานต้องไม่เปิดให้คนที่ยังไม่ได้ Login
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
// ALL REPORT ROUTES REQUIRE LOGIN
//
// ทุก Report ต้อง Login ก่อน
//
// หลังผ่าน:
//
// authenticate
//
// จะมี:
//
// req.user
//
// เช่น:
//
// {
//     id,
//     username,
//     fullname,
//     role
// }
// =====================================================

router.use(
    authenticate
);


// =====================================================
// STOCK REPORT
//
// GET:
//
// /api/reports/stock
//
// ตัวอย่าง:
//
// /api/reports/stock
//
// หรือ:
//
// /api/reports/stock?format=excel
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/stock",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.stockReport.bind(
        ReportController
    )

);


// =====================================================
// MOVEMENT REPORT
//
// GET:
//
// /api/reports/movement
//
// ตัวอย่าง:
//
// /api/reports/movement
//
// หรือ:
//
// /api/reports/movement?format=excel
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/movement",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.movementReport.bind(
        ReportController
    )

);


// =====================================================
// IMPORT REPORT
//
// GET:
//
// /api/reports/import
//
// รองรับ:
//
// ?startDate=YYYY-MM-DD
// ?endDate=YYYY-MM-DD
// ?format=excel
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/import",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.importReport.bind(
        ReportController
    )

);


// =====================================================
// EXPORT REPORT
//
// GET:
//
// /api/reports/export
//
// รองรับ:
//
// ?startDate=YYYY-MM-DD
// ?endDate=YYYY-MM-DD
// ?format=excel
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/export",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.exportReport.bind(
        ReportController
    )

);


// =====================================================
// SUPPLIER REPORT
//
// GET:
//
// /api/reports/supplier
//
// รองรับ:
//
// ?startDate=YYYY-MM-DD
// ?endDate=YYYY-MM-DD
// ?format=excel
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/supplier",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.supplierReport.bind(
        ReportController
    )

);


// =====================================================
// SUMMARY REPORT
//
// GET:
//
// /api/reports/summary
//
// รองรับ:
//
// ?startDate=YYYY-MM-DD
// ?endDate=YYYY-MM-DD
// ?format=excel
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/summary",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.summaryReport.bind(
        ReportController
    )

);


// =====================================================
// INVENTORY VALUE
//
// GET:
//
// /api/reports/inventory-value
//
// ใช้ดู:
//
// - มูลค่า Stock
// - จำนวนสินค้า
// - ข้อมูล Inventory Value
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/inventory-value",

    authorize(
        ...ROLE.VIEW
    ),

    ReportController.inventoryValue.bind(
        ReportController
    )

);


// =====================================================
// EXPORT EXCEL
//
// GET:
//
// /api/reports/export-excel/:type
//
// IMPORTANT:
//
// Route นี้ต้องรองรับ URL ที่ Dashboard
// ใช้งานอยู่:
//
// /api/reports/export-excel/stock
// /api/reports/export-excel/movement
// /api/reports/export-excel/import
// /api/reports/export-excel/export
// /api/reports/export-excel/supplier
// /api/reports/export-excel/summary
//
// Dashboard ปัจจุบันส่ง:
//
// dateFrom
// dateTo
//
// ผ่าน Query String
//
// ตัวอย่าง:
//
// /api/reports/export-excel/import
//     ?dateFrom=2026-01-01
//     &dateTo=2026-01-31
//
// Route นี้จะส่งต่อไปยัง ReportController
// โดยใช้:
//
// req.query.format = "excel"
//
// Controller เดิมจะสร้าง Excel ให้
// =====================================================

router.get(
    "/export-excel/:type",

    authorize(
        ...ROLE.VIEW
    ),

    async (
        req,
        res,
        next
    ) => {

        try {

            const type =
                String(
                    req.params.type ||
                    ""
                )
                    .trim()
                    .toLowerCase();


            // ---------------------------------------------
            // สำเนา Query
            //
            // ไม่เขียนทับ req.query โดยตรง
            // เพราะ Express บาง Version
            // อาจไม่อนุญาตให้แก้
            // ---------------------------------------------

            const originalQuery =
                req.query ||
                {};


            const query =
                {

                    ...originalQuery,

                    format:
                        "excel"

                };


            // ---------------------------------------------
            // สร้าง Wrapper Request
            //
            // Controller เดิมใช้:
            //
            // req.query
            //
            // ดังนั้นส่ง req ใหม่
            // ที่มี format=excel
            //
            // เพื่อไม่ต้องแก้ Controller
            // ---------------------------------------------

            const reportReq =
                Object.create(
                    req
                );


            Object.defineProperty(
                reportReq,
                "query",
                {

                    value:
                        query,

                    enumerable:
                        true,

                    configurable:
                        true

                }
            );


            // ---------------------------------------------
            // STOCK
            // ---------------------------------------------

            if (
                type ===
                "stock"
            ) {

                return await ReportController
                    .stockReport
                    .call(
                        ReportController,
                        reportReq,
                        res
                    );

            }


            // ---------------------------------------------
            // MOVEMENT
            // ---------------------------------------------

            if (
                type ===
                "movement"
            ) {

                return await ReportController
                    .movementReport
                    .call(
                        ReportController,
                        reportReq,
                        res
                    );

            }


            // ---------------------------------------------
            // IMPORT
            // ---------------------------------------------

            if (
                type ===
                "import"
            ) {

                return await ReportController
                    .importReport
                    .call(
                        ReportController,
                        reportReq,
                        res
                    );

            }


            // ---------------------------------------------
            // EXPORT
            // ---------------------------------------------

            if (
                type ===
                "export"
            ) {

                return await ReportController
                    .exportReport
                    .call(
                        ReportController,
                        reportReq,
                        res
                    );

            }


            // ---------------------------------------------
            // SUPPLIER
            // ---------------------------------------------

            if (
                type ===
                "supplier"
            ) {

                return await ReportController
                    .supplierReport
                    .call(
                        ReportController,
                        reportReq,
                        res
                    );

            }


            // ---------------------------------------------
            // SUMMARY
            // ---------------------------------------------

            if (
                type ===
                "summary"
            ) {

                return await ReportController
                    .summaryReport
                    .call(
                        ReportController,
                        reportReq,
                        res
                    );

            }


            // ---------------------------------------------
            // ไม่รองรับ Report Type
            // ---------------------------------------------

            return res
                .status(
                    400
                )
                .json({

                    success:
                        false,

                    message:
                        "Invalid report type"

                });

        } catch (
            err
        ) {

            return next(
                err
            );

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports =
    router;