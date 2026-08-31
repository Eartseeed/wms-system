const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
//
// Route นี้ถูกใช้งานผ่าน:
//
// /api/exports
// =====================================================

const router =
    express.Router();


// =====================================================
// FILE SYSTEM
//
// Route เดิมมีระบบ Upload ของตัวเอง
//
// ใช้สำหรับ:
//
// - สร้าง uploads directory
// - จัดการไฟล์ที่อัปโหลด
// =====================================================

const multer =
    require(
        "multer"
    );


const path =
    require(
        "path"
    );


const fs =
    require(
        "fs"
    );


// =====================================================
// EXPORT SERVICE
//
// ใช้สำหรับจัดการ Export Invoice
//
// เช่น:
//
// - ดึงข้อมูล
// - สร้าง Export
// - แก้ไข Export
// - ลบ Export
//
// Service เป็นผู้จัดการ Stock Flow
// =====================================================

const ExportService =
    require(
        "../services/exportService"
    );


// =====================================================
// AUTH MIDDLEWARE
//
// authenticate
//     ตรวจสอบว่า User Login แล้วหรือไม่
//
// authorize
//     ตรวจสอบสิทธิ์ตาม Role
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
//     ดู / สร้าง / แก้ไข / ลบ
//
// SUPERVISOR
//     ดู / สร้าง / แก้ไข
//
// EMPLOYEE
//     ดู / สร้าง
//
// การลบ Export จำกัด ADMIN เท่านั้น
// เพราะกระทบ Stock และ Dashboard
// =====================================================

const ROLE =
    {

        ALL:
            [
                "ADMIN",
                "SUPERVISOR",
                "EMPLOYEE"
            ],


        EDIT:
            [
                "ADMIN",
                "SUPERVISOR"
            ],


        ADMIN:
            [
                "ADMIN"
            ]

    };


// =====================================================
// UPLOAD DIRECTORY
//
// เก็บไฟล์ไว้ที่:
//
// backend/uploads
//
// ถ้า Folder ยังไม่มี
// ระบบจะสร้างให้อัตโนมัติ
// =====================================================

const uploadDir =
    path.join(
        __dirname,
        "..",
        "uploads"
    );


if (
    !fs.existsSync(
        uploadDir
    )
) {

    fs.mkdirSync(
        uploadDir,
        {

            recursive:
                true

        }
    );

}


// =====================================================
// MULTER STORAGE
//
// กำหนด:
//
// destination
//     uploads directory
//
// filename
//     Date.now() + filename
//
// เพื่อป้องกันไฟล์ชื่อซ้ำ
// =====================================================

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    uploadDir
                );

            },


        filename:
            function (
                req,
                file,
                cb
            ) {

                const ext =
                    path.extname(
                        file.originalname
                    );


                const name =
                    path.basename(
                        file.originalname,
                        ext
                    )
                        .replace(
                            /[^a-zA-Z0-9_-]/g,
                            "_"
                        );


                const filename =
                    `${Date.now()}_${name}${ext}`;


                cb(
                    null,
                    filename
                );

            }

    });


const upload =
    multer({
        storage
    });


// =====================================================
// DOCUMENT FIELDS
//
// รายการต้องตรงกับ:
//
// Frontend
// Database
// ExportService
//
// Export มีเอกสาร 8 Field
// =====================================================

const documentFields =
    [

        {
            name:
                "invoice_file",

            maxCount:
                1
        },

        {
            name:
                "payment_file",

            maxCount:
                1
        },

        {
            name:
                "formd_file",

            maxCount:
                1
        },

        {
            name:
                "phytos_file",

            maxCount:
                1
        },

        {
            name:
                "tax_file",

            maxCount:
                1
        },

        {
            name:
                "export_license_file",

            maxCount:
                1
        },

        {
            name:
                "origin_file",

            maxCount:
                1
        },

        {
            name:
                "acdd_file",

            maxCount:
                1
        }

    ];


// =====================================================
// GET UPLOADED FILES
//
// แปลง req.files:
//
// {
//     invoice_file: [
//         {
//             filename: "xxxxx.pdf"
//         }
//     ]
// }
//
// เป็น:
//
// {
//     invoice_file: "xxxxx.pdf"
// }
//
// เพื่อส่งเข้า ExportService
// =====================================================

function getUploadedFiles(
    files = {}
) {

    const result =
        {};


    documentFields.forEach(
        (
            {
                name
            }
        ) => {

            if (
                files[name] &&
                files[name][0]
            ) {

                result[name] =
                    files[name][0].filename;

            }

        }
    );


    return result;

}


// =====================================================
// SUCCESS RESPONSE
//
// ทำให้ Response มีรูปแบบเดียวกัน
//
// {
//     success: true,
//     data: ...
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
// {
//     success: false,
//     message: "..."
// }
// =====================================================

function error(
    res,
    err,
    status = 400
) {

    console.error(
        "Export API Error:",
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
                "Export operation failed"

        });

}


// =====================================================
// ALL EXPORT ROUTES REQUIRE LOGIN
//
// ทุก Route ด้านล่างต้อง Login ก่อน
//
// ถ้า Token ไม่ถูกต้อง:
//
// 401 Unauthorized
// =====================================================

router.use(
    authenticate
);


// =====================================================
// GET ALL
//
// GET:
//
// /api/exports
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทุก Role สามารถดูข้อมูลได้
// =====================================================

router.get(
    "/",

    authorize(
        ...ROLE.ALL
    ),

    async (
        req,
        res
    ) => {

        try {

            const data =
                await ExportService.getAll();


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
// GET BY ID
//
// GET:
//
// /api/exports/:id
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/:id",

    authorize(
        ...ROLE.ALL
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
                        "Invalid export ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ดึงข้อมูล Export
            // ---------------------------------------------

            const data =
                await ExportService.getById(
                    id
                );


            // ---------------------------------------------
            // ไม่พบข้อมูล
            // ---------------------------------------------

            if (
                !data
            ) {

                return error(
                    res,
                    new Error(
                        "Export invoice not found"
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

            return error(
                res,
                err,
                500
            );

        }

    }
);


// =====================================================
// CREATE
//
// POST:
//
// /api/exports
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทุก Role สามารถสร้าง Export ได้
//
// Flow:
//
// Export Invoice
//      ↓
// export_invoice
//      ↓
// StockService.issue()
//      ↓
// Stock ลด
// =====================================================

router.post(
    "/",

    authorize(
        ...ROLE.ALL
    ),

    upload.fields(
        documentFields
    ),

    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // ดึงไฟล์ที่ Upload
            // ---------------------------------------------

            const uploaded =
                getUploadedFiles(
                    req.files
                );


            // ---------------------------------------------
            // รวมข้อมูล Form และ File
            //
            // req.body
            //     ข้อมูล Export
            //
            // uploaded
            //     ชื่อไฟล์เอกสาร
            // ---------------------------------------------

            const data =
                {

                    ...(req.body ||
                        {}),


                    ...uploaded,


                    // ---------------------------------
                    // เก็บ User ที่สร้าง
                    //
                    // ไม่บังคับ Service ต้องใช้
                    // เพื่อไม่ทำลาย Flow เดิม
                    // ---------------------------------

                    created_by:
                        req.user?.username ||
                        ""

                };


            // ---------------------------------------------
            // สร้าง Export
            //
            // Service จะจัดการ:
            //
            // - Validate
            // - Export Invoice
            // - Stock Issue
            // ---------------------------------------------

            const result =
                await ExportService.create(
                    data
                );


            return success(
                res,

                result,

                201,

                "Export created successfully"
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
// UPDATE
//
// PUT:
//
// /api/exports/:id
//
// ROLE:
//
// ADMIN
// SUPERVISOR
//
// EMPLOYEE:
//
// ไม่มีสิทธิ์แก้ไข Export ที่บันทึกแล้ว
//
// Flow:
//
// Reverse Stock เดิม
//      ↓
// Issue Stock ใหม่
//      ↓
// Update Export
// =====================================================

router.put(
    "/:id",

    authorize(
        ...ROLE.EDIT
    ),

    upload.fields(
        documentFields
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
                        "Invalid export ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ตรวจสอบข้อมูลเดิม
            // ---------------------------------------------

            const old =
                await ExportService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Export invoice not found"
                    ),
                    404
                );

            }


            // ---------------------------------------------
            // ดึงเฉพาะไฟล์ใหม่
            //
            // ถ้าไม่มีการ Upload ไฟล์ใหม่
            // File เดิมจะยังคงอยู่
            // ---------------------------------------------

            const uploaded =
                getUploadedFiles(
                    req.files
                );


            // ---------------------------------------------
            // รวมข้อมูล
            // ---------------------------------------------

            const data =
                {

                    ...(req.body ||
                        {}),


                    ...uploaded,


                    // ---------------------------------
                    // เก็บผู้แก้ไข
                    // ---------------------------------

                    updated_by:
                        req.user?.username ||
                        ""

                };


            // ---------------------------------------------
            // Update Export
            // ---------------------------------------------

            const result =
                await ExportService.update(
                    id,
                    data
                );


            return success(
                res,

                result,

                200,

                "Export updated successfully"
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
// DELETE
//
// DELETE:
//
// /api/exports/:id
//
// ROLE:
//
// ADMIN ONLY
//
// การลบ Export มีผลต่อ:
//
// - Stock
// - Stock Movement
// - Dashboard
// - Report
//
// ExportService.delete()
//
// จะ Reverse Stock ก่อน
// แล้วจึงลบข้อมูล Export
// =====================================================

router.delete(
    "/:id",

    authorize(
        ...ROLE.ADMIN
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
                        "Invalid export ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ตรวจสอบว่าข้อมูลมีอยู่จริง
            // ---------------------------------------------

            const old =
                await ExportService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Export invoice not found"
                    ),
                    404
                );

            }


            // ---------------------------------------------
            // ลบ Export
            //
            // Service จัดการ:
            //
            // 1. Reverse Stock
            // 2. Delete Export
            // 3. Delete Physical Files
            // ---------------------------------------------

            const result =
                await ExportService.delete(
                    id
                );


            return success(
                res,

                result,

                200,

                "Export deleted successfully"
            );

        } catch (
            err
        ) {

            const status =
                err?.message ===
                "Export invoice not found"

                    ? 404

                    : 400;


            return error(
                res,
                err,
                status
            );

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports =
    router;