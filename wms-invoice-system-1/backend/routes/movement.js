const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
//
// Route นี้ถูกใช้งานผ่าน:
//
// /api/movement
//
// ตัวอย่าง:
//
// GET /api/movement
//
// GET /api/movement/1
//
// GET /api/movement/product/10001
//
// GET /api/movement/reference/IMP-001
// =====================================================

const router =
    express.Router();


// =====================================================
// STOCK MOVEMENT SERVICE
//
// ใช้ Service หลักของระบบ:
//
// backend/services/movementService.js
//
// หน้าที่:
//
// - ดูประวัติการเคลื่อนไหว Stock
// - ค้นหา Movement ตามเงื่อนไข
// - ดูรายการรับเข้า
// - ดูรายการจ่ายออก
// - ตรวจสอบประวัติ Import
// - ตรวจสอบประวัติ Export
//
// IMPORTANT:
//
// Movement เป็นข้อมูลประวัติ
//
// ข้อมูล Movement ควรถูกสร้างจาก:
//
// 1. Import
//    → StockService.receive()
//
// 2. Export
//    → StockService.issue()
//
// 3. Manual Stock Receive
//    → StockService.receive()
//
// 4. Manual Stock Issue
//    → StockService.issue()
//
// 5. Reverse Import
//    → StockService.reverseReceive()
//
// 6. Reverse Export
//    → StockService.reverseIssue()
//
// Route นี้จึงมีหน้าที่หลักคือ:
//
// - READ
// - SEARCH
// - VIEW HISTORY
//
// ไม่ควรเปิดให้:
//
// - แก้ไข Movement
// - ลบ Movement
//
// เพราะ Movement เป็นประวัติ Audit
// ของการเปลี่ยนแปลง Stock
// =====================================================

const MovementService =
    require(
        "../services/movementService"
    );


// =====================================================
// AUTH MIDDLEWARE
//
// authenticate
//
// หน้าที่:
//
// - ตรวจสอบ Authorization Header
// - ตรวจสอบ Bearer Token
// - ตรวจสอบ JWT
// - สร้าง req.user
//
// authorize
//
// หน้าที่:
//
// - ตรวจสอบ Role
// - จำกัดสิทธิ์เข้าถึง Route
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
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทั้ง 3 Role สามารถดู Movement ได้
//
// เหตุผล:
//
// EMPLOYEE จำเป็นต้องตรวจสอบ:
//
// - Import ที่ตนเองทำ
// - Export ที่ตนเองทำ
// - Stock ที่เพิ่ม
// - Stock ที่ลด
//
// แต่ไม่มี Route สำหรับ:
//
// - Update Movement
// - Delete Movement
//
// เพื่อป้องกันประวัติ Stock ผิดพลาด
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
// SUCCESS RESPONSE
//
// ทำให้ Response มีรูปแบบเดียวกัน
//
// ตัวอย่าง:
//
// {
//     success: true,
//     data: []
// }
//
// หรือ:
//
// {
//     success: true,
//     message: "Success",
//     data: []
// }
// =====================================================

function success(
    res,
    data,
    status = 200,
    message = null
) {

    return res
        .status(
            status
        )
        .json({

            success:
                true,


            ...(message
                ? {

                    message

                }
                : {}),


            data

        });

}


// =====================================================
// ERROR RESPONSE
//
// รูปแบบ:
//
// {
//     success: false,
//     message: "..."
// }
//
// Error จะถูก log ที่ Backend
// เพื่อช่วย Debug
// =====================================================

function error(
    res,
    err,
    status = 400
) {

    console.error(
        "Movement API Error:",
        err
    );


    return res
        .status(
            status
        )
        .json({

            success:
                false,

            message:
                err?.message ||
                "Movement operation failed"

        });

}


// =====================================================
// NORMALIZE PRODUCT CODE
//
// Product Code ในระบบต้องเป็นตัวเลข
//
// ตัวอย่างที่ถูกต้อง:
//
// 10001
// 0001
// 123456
//
// ถ้า Frontend ส่ง:
//
// productNumber
//
// ระบบจะสามารถใช้ alias
// ได้ใน Route ที่เรียก Product
// =====================================================

function normalizeProductCode(
    value
) {

    const productCode =
        String(
            value ??
            ""
        )
            .trim();


    if (
        !productCode
    ) {

        throw new Error(
            "Product number is required"
        );

    }


    if (
        !/^\d+$/.test(
            productCode
        )
    ) {

        throw new Error(
            "Product number must contain numbers only"
        );

    }


    return productCode;

}


// =====================================================
// NORMALIZE REFERENCE NUMBER
//
// ใช้สำหรับ:
//
// Import Invoice
// Export Invoice
// Reference Number
// Movement Reference
//
// ตัวอย่าง:
//
// IMP-001
// EXP-001
// INV-2026-001
//
// Reference ไม่จำเป็นต้องเป็นตัวเลข
// =====================================================

function normalizeReferenceNo(
    value
) {

    const referenceNo =
        String(
            value ??
            ""
        )
            .trim();


    if (
        !referenceNo
    ) {

        throw new Error(
            "Reference number is required"
        );

    }


    return referenceNo;

}


// =====================================================
// ALL MOVEMENT ROUTES REQUIRE LOGIN
//
// ทุก Route ด้านล่างต้องผ่าน:
//
// authenticate
//
// ก่อนเสมอ
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
// =====================================================

router.use(

    authenticate

);


// =====================================================
// GET ALL MOVEMENTS
//
// GET:
//
// /api/movement
//
// =====================================================
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// =====================================================
//
// รองรับ Query Parameters
//
// เช่น:
//
// /api/movement?limit=100
//
// /api/movement?product_code=10001
//
// /api/movement?reference_no=IMP-001
//
// /api/movement?type=IN
//
// /api/movement?from_date=2026-01-01
//
// /api/movement?to_date=2026-12-31
//
// IMPORTANT:
//
// Query Parameters ทั้งหมด
// จะถูกส่งต่อไป MovementService
//
// req.query
//
// เพื่อรักษาความสามารถเดิม
// ของ Service
// =====================================================

router.get(

    "/",

    authorize(
        ...ROLE.VIEW
    ),

    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // เรียก Service เดิมของระบบ
            //
            // ส่ง Query ต่อไปทั้งหมด
            //
            // ถ้าไม่มี Query:
            //
            // req.query = {}
            // ---------------------------------------------

            const data =
                await MovementService.getAll(
                    req.query
                );


            return success(
                res,
                data
            );

        } catch (
            err
        ) {

            return error(
                res,
                err,
                500
            );

        }

    }

);


// =====================================================
// GET MOVEMENT BY PRODUCT
//
// GET:
//
// /api/movement/product/:productCode
//
// ตัวอย่าง:
//
// /api/movement/product/10001
//
// =====================================================
//
// IMPORTANT:
//
// Route นี้ต้องอยู่ก่อน:
//
// /:id
//
// เพราะถ้าอยู่หลัง:
//
// Express อาจตีความ:
//
// product
//
// เป็น:
//
// id
//
// =====================================================
//
// ระบบจะตรวจสอบก่อนว่า:
//
// MovementService.getByProduct()
//
// มีอยู่หรือไม่
//
// ถ้ามี:
//
// ใช้ method โดยตรง
//
// ถ้าไม่มี:
//
// ใช้ getAll() พร้อม Filter:
//
// {
//     product_code: productCode
// }
//
// วิธีนี้ช่วยให้ Route ไม่พัง
// หาก Service เดิมยังไม่มี method นี้
// =====================================================

router.get(

    "/product/:productCode",

    authorize(
        ...ROLE.VIEW
    ),

    async (
        req,
        res
    ) => {

        try {

            const productCode =
                normalizeProductCode(
                    req.params.productCode
                );


            let data;


            // ---------------------------------------------
            // METHOD 1
            //
            // ใช้ getByProduct ถ้า Service มี
            // ---------------------------------------------

            if (
                typeof MovementService.getByProduct ===
                "function"
            ) {

                data =
                    await MovementService.getByProduct(
                        productCode
                    );

            }


            // ---------------------------------------------
            // METHOD 2
            //
            // Fallback:
            //
            // ใช้ getAll()
            //
            // พร้อมส่ง Product Filter
            //
            // ---------------------------------------------

            else {

                data =
                    await MovementService.getAll({

                        ...req.query,


                        product_code:
                            productCode,


                        product_number:
                            productCode


                    });

            }


            return success(
                res,
                data
            );

        } catch (
            err
        ) {

            return error(
                res,
                err,
                400
            );

        }

    }

);


// =====================================================
// GET MOVEMENT BY REFERENCE
//
// GET:
//
// /api/movement/reference/:referenceNo
//
// ตัวอย่าง:
//
// /api/movement/reference/IMP-001
//
// /api/movement/reference/EXP-001
//
// =====================================================
//
// ใช้สำหรับค้นหา:
//
// - Import Invoice
// - Export Invoice
// - Reference Number
//
// =====================================================
//
// ระบบจะตรวจสอบว่า:
//
// MovementService.getByReference()
//
// มีอยู่หรือไม่
//
// ถ้ามี:
//
// ใช้ method โดยตรง
//
// ถ้าไม่มี:
//
// ใช้ getAll() พร้อม Query Filter
//
// =====================================================

router.get(

    "/reference/:referenceNo",

    authorize(
        ...ROLE.VIEW
    ),

    async (
        req,
        res
    ) => {

        try {

            const referenceNo =
                normalizeReferenceNo(
                    req.params.referenceNo
                );


            let data;


            // ---------------------------------------------
            // METHOD 1
            //
            // ใช้ getByReference ถ้า Service มี
            // ---------------------------------------------

            if (
                typeof MovementService.getByReference ===
                "function"
            ) {

                data =
                    await MovementService.getByReference(
                        referenceNo
                    );

            }


            // ---------------------------------------------
            // METHOD 2
            //
            // Fallback:
            //
            // ส่ง Filter เข้า getAll()
            //
            // ---------------------------------------------

            else {

                data =
                    await MovementService.getAll({

                        ...req.query,


                        reference_no:
                            referenceNo,


                        movement_no:
                            referenceNo


                    });

            }


            return success(
                res,
                data
            );

        } catch (
            err
        ) {

            return error(
                res,
                err,
                400
            );

        }

    }

);


// =====================================================
// GET MOVEMENT BY ID
//
// GET:
//
// /api/movement/:id
//
// =====================================================
//
// ตัวอย่าง:
//
// /api/movement/1
//
// =====================================================
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// =====================================================
//
// IMPORTANT:
//
// Route นี้ต้องอยู่หลัง:
//
// /product/:productCode
//
// และ:
//
// /reference/:referenceNo
//
// เพื่อไม่ให้ Express เข้าใจว่า:
//
// product
//
// หรือ:
//
// reference
//
// เป็น ID
//
// =====================================================

router.get(

    "/:id",

    authorize(
        ...ROLE.VIEW
    ),

    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            // ---------------------------------------------
            // ตรวจสอบ ID
            // ---------------------------------------------

            if (

                !Number.isInteger(
                    id
                )

                ||

                id <= 0

            ) {

                return error(

                    res,

                    new Error(
                        "Invalid movement ID"
                    ),

                    400

                );

            }


            // ---------------------------------------------
            // ตรวจสอบ Service Method
            //
            // getById เป็น method หลัก
            // ที่ไฟล์เดิมใช้อยู่
            // ---------------------------------------------

            if (
                typeof MovementService.getById !==
                "function"
            ) {

                throw new Error(
                    "MovementService.getById is not implemented"
                );

            }


            // ---------------------------------------------
            // GET MOVEMENT
            // ---------------------------------------------

            const data =
                await MovementService.getById(
                    id
                );


            // ---------------------------------------------
            // NOT FOUND
            // ---------------------------------------------

            if (
                !data
            ) {

                return error(

                    res,

                    new Error(
                        "Movement not found"
                    ),

                    404

                );

            }


            return success(
                res,
                data
            );

        } catch (
            err
        ) {

            // ---------------------------------------------
            // แยก Error
            //
            // Error จาก Service ที่เป็น
            // Not Found
            //
            // ---------------------------------------------

            if (
                err?.message ===
                "Movement not found"
            ) {

                return error(
                    res,
                    err,
                    404
                );

            }


            return error(
                res,
                err,
                500
            );

        }

    }

);


// =====================================================
// ROUTE NOT FOUND
//
// Request ที่เข้ามาภายใต้:
//
// /api/movement
//
// แต่ไม่ตรงกับ Route ด้านบน
//
// =====================================================
//
// ตัวอย่าง:
//
// GET /api/movement/unknown/path
//
// Response:
//
// 404
//
// {
//     success: false,
//     message: "Movement API route not found"
// }
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
                    "Movement API route not found",


                path:
                    req.originalUrl

            });

    }

);


// =====================================================
// EXPORT ROUTER
//
// server.js ใช้งาน:
//
// const movementRoutes =
//     require("./routes/movement");
//
// app.use(
//     "/api/movement",
//     movementRoutes
// );
//
// =====================================================

module.exports =
    router;