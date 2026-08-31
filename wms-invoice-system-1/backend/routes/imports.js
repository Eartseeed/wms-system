const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
//
// Route นี้ถูกใช้งานผ่าน:
//
// /api/imports
// =====================================================

const router =
    express.Router();


// =====================================================
// IMPORT SERVICE
//
// ใช้สำหรับจัดการข้อมูล Import Invoice
// เช่น:
//
// - ดึงข้อมูล
// - ค้นหา Invoice
// - สร้าง Import
// - แก้ไข Import
// - ลบ Import
// - ลบไฟล์เอกสาร
// =====================================================

const ImportService =
    require(
        "../services/importService"
    );


// =====================================================
// UPLOAD MIDDLEWARE
//
// ใช้รับไฟล์เอกสารที่ส่งมาจาก Frontend
//
// IMPORTANT:
//
// ใช้ middleware/upload เดิมของระบบ
// ไม่สร้าง Multer ใหม่ใน Route นี้
// =====================================================

const upload =
    require(
        "../middleware/upload"
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
// IMPORTANT:
//
// ต้องใช้ชื่อ Role ตัวพิมพ์ใหญ่
// ให้ตรงกับ:
//
// middleware/auth.js
// normalizeRole()
//
// และข้อมูล Role จาก JWT
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ADMIN
//     จัดการได้ทุกอย่าง
//
// SUPERVISOR
//     ดู / สร้าง / แก้ไข / ลบไฟล์
//
// EMPLOYEE
//     ดู / สร้าง
//
// หมายเหตุ:
//
// DELETE Import จำกัด ADMIN เท่านั้น
// เพื่อป้องกันข้อมูล Import สูญหาย
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
// DOCUMENT UPLOAD FIELDS
//
// รายการชื่อ Field ต้องตรงกับ:
//
// Frontend
// Multer
// Database
// ImportService
//
// ไม่ควรเปลี่ยนชื่อเอง
// =====================================================

const importUploadFields =
    [

        {

            name:
                "invoice_file",

            maxCount:
                1

        },

        {

            name:
                "acdd_file",

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
                "truck_file",

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
                "fda_file",

            maxCount:
                1

        },

        {

            name:
                "import_license_file",

            maxCount:
                1

        }

    ];


// =====================================================
// ALLOWED DOCUMENT FIELD NAMES
//
// ใช้ตรวจสอบก่อนอนุญาตให้ลบไฟล์
//
// ป้องกัน Request เช่น:
//
// DELETE /api/imports/1/file/password
//
// หรือชื่อ Field ที่ไม่ได้อยู่ใน Import
// =====================================================

const allowedDocumentFields =
    new Set(
        importUploadFields.map(
            (
                item
            ) =>
                item.name
        )
    );


// =====================================================
// GET UPLOADED FILES
//
// req.files จาก multer จะมีรูปแบบ:
//
// {
//     invoice_file: [
//         {
//             filename: "xxxxx.pdf"
//         }
//     ]
// }
//
// Function นี้จะแปลงเป็น:
//
// {
//     invoice_file: "xxxxx.pdf"
// }
//
// เพื่อส่งเข้า ImportService
// =====================================================

function getUploadedFiles(
    files = {}
) {

    const result =
        {};


    importUploadFields.forEach(
        (
            {
                name
            }
        ) => {

            // ---------------------------------------------
            // ตรวจสอบว่า Field นี้มีไฟล์หรือไม่
            // ---------------------------------------------

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
// ทำให้ API ทุก Route
// ส่งรูปแบบ Response เหมือนกัน
//
// ตัวอย่าง:
//
// {
//     success: true,
//     message: "...",
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
// ทำให้ Error ทุก Route
// ส่ง Response รูปแบบเดียวกัน
//
// ตัวอย่าง:
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
        "Import API Error:",
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
                "Import operation failed"

        });

}


// =====================================================
// ALL IMPORT ROUTES REQUIRE LOGIN
//
// ทุก API ด้านล่างต้องผ่าน:
//
// authenticate
//
// ก่อนเสมอ
//
// ถ้าไม่มี Token
// หรือ Token ไม่ถูกต้อง
//
// ระบบจะตอบ:
//
// 401 Unauthorized
//
// IMPORTANT:
//
// หลังผ่าน Middleware นี้:
//
// req.user = {
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
// GET ALL IMPORTS
//
// GET:
//
// /api/imports
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทุก Role สามารถดูข้อมูล Import ได้
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
                await ImportService.getAll();


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
// GET IMPORT BY INVOICE
//
// GET:
//
// /api/imports/invoice/:invoiceNo
//
// IMPORTANT:
//
// Route นี้ต้องอยู่ก่อน:
//
// /:id
//
// เพราะ Express อาจตีความคำว่า:
//
// invoice
//
// เป็น ID ได้
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
// =====================================================

router.get(
    "/invoice/:invoiceNo",

    authorize(
        ...ROLE.ALL
    ),

    async (
        req,
        res
    ) => {

        try {

            const invoiceNo =
                String(
                    req.params.invoiceNo ??
                    ""
                )
                    .trim();


            // ---------------------------------------------
            // ตรวจสอบ Invoice No
            // ---------------------------------------------

            if (
                !invoiceNo
            ) {

                return error(
                    res,
                    new Error(
                        "Invoice No is required"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ค้นหา Import Invoice
            // ---------------------------------------------

            const data =
                await ImportService.findByInvoice(
                    invoiceNo
                );


            // ---------------------------------------------
            // ถ้า Service ไม่พบข้อมูล
            // ---------------------------------------------

            if (
                !data
            ) {

                return error(
                    res,
                    new Error(
                        "Invoice not found"
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
// GET IMPORT BY ID
//
// GET:
//
// /api/imports/:id
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
                        "Invalid import ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ดึงข้อมูล
            // ---------------------------------------------

            const data =
                await ImportService.getById(
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
                        "Import not found"
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
// CREATE IMPORT
//
// POST:
//
// /api/imports
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทุก Role สามารถสร้าง Import ได้
//
// Flow:
//
// Frontend
//
//     ↓
//
// authenticate
//
//     ↓
//
// authorize
//
//     ↓
//
// upload.fields
//
//     ↓
//
// getUploadedFiles
//
//     ↓
//
// ImportService.create
// =====================================================

router.post(
    "/",

    authorize(
        ...ROLE.ALL
    ),

    // ---------------------------------------------
    // รับไฟล์ก่อนเข้า Route Handler
    // ---------------------------------------------

    upload.fields(
        importUploadFields
    ),

    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // แปลงไฟล์เป็นชื่อไฟล์
            // ---------------------------------------------

            const uploaded =
                getUploadedFiles(
                    req.files
                );


            // ---------------------------------------------
            // รวมข้อมูล Form + ไฟล์
            // ---------------------------------------------

            const data =
                {

                    ...(req.body ||
                        {}),


                    ...uploaded,


                    // ---------------------------------
                    // บันทึกว่า User คนใดสร้าง
                    //
                    // ข้อมูลมาจาก JWT
                    // ผ่าน req.user
                    // ---------------------------------

                    created_by:
                        req.user?.username ||
                        ""

                };


            // ---------------------------------------------
            // สร้าง Import
            // ---------------------------------------------

            const result =
                await ImportService.create(
                    data
                );


            return success(
                res,

                result,

                201,

                "Import created successfully"
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
// UPDATE IMPORT
//
// PUT:
//
// /api/imports/:id
//
// ROLE:
//
// ADMIN
// SUPERVISOR
//
// EMPLOYEE:
//
// ไม่มีสิทธิ์แก้ไขข้อมูล
//
// เหตุผล:
//
// EMPLOYEE สามารถกรอกข้อมูลใหม่ได้
// แต่การแก้ข้อมูลที่บันทึกแล้ว
// ต้องให้ SUPERVISOR ตรวจสอบ
//
// Flow:
//
// ImportService.update
//
//     ↓
//
// Reverse Stock เดิม
//
//     ↓
//
// Update Import
//
//     ↓
//
// Receive Stock ใหม่
// =====================================================

router.put(
    "/:id",

    authorize(
        ...ROLE.EDIT
    ),

    upload.fields(
        importUploadFields
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
                        "Invalid import ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ตรวจสอบว่าข้อมูลเดิมมีอยู่จริง
            // ---------------------------------------------

            const old =
                await ImportService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Import not found"
                    ),
                    404
                );

            }


            // ---------------------------------------------
            // ดึงชื่อไฟล์ใหม่
            //
            // เฉพาะ Field ที่มีการ Upload ใหม่
            // จะถูกส่งเข้า Service
            //
            // File เดิมที่ไม่ได้เปลี่ยน
            // ไม่ถูกเขียนทับ
            // ---------------------------------------------

            const uploaded =
                getUploadedFiles(
                    req.files
                );


            // ---------------------------------------------
            // รวมข้อมูลใหม่
            // ---------------------------------------------

            const data =
                {

                    ...(req.body ||
                        {}),


                    ...uploaded,


                    // ---------------------------------
                    // บันทึกว่าใครเป็นผู้แก้ไข
                    // ---------------------------------

                    updated_by:
                        req.user?.username ||
                        ""

                };


            // ---------------------------------------------
            // Update
            // ---------------------------------------------

            const result =
                await ImportService.update(
                    id,
                    data
                );


            return success(
                res,

                result,

                200,

                "Import updated successfully"
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
// DELETE ONE DOCUMENT FILE
//
// DELETE:
//
// /api/imports/:id/file/:field
//
// ตัวอย่าง:
//
// DELETE
// /api/imports/10/file/invoice_file
//
// ROLE:
//
// ADMIN
// SUPERVISOR
//
// EMPLOYEE:
//
// ไม่มีสิทธิ์ลบไฟล์เอกสาร
//
// IMPORTANT:
//
// Route นี้ต้องอยู่ก่อน:
//
// DELETE /:id
//
// ถึงแม้ Express จะสามารถแยกได้
// แต่การเรียง Route ให้ชัดเจน
// ปลอดภัยกว่า
// =====================================================

router.delete(
    "/:id/file/:field",

    authorize(
        ...ROLE.EDIT
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


            const field =
                String(
                    req.params.field ||
                    ""
                )
                    .trim();


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
                        "Invalid import ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ตรวจสอบชื่อ Field
            //
            // อนุญาตเฉพาะ:
            //
            // invoice_file
            // acdd_file
            // formd_file
            // truck_file
            // payment_file
            // fda_file
            // import_license_file
            // ---------------------------------------------

            if (
                !allowedDocumentFields.has(
                    field
                )
            ) {

                return error(
                    res,
                    new Error(
                        "Invalid document field"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ตรวจสอบว่า Import มีอยู่จริง
            // ---------------------------------------------

            const old =
                await ImportService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Import not found"
                    ),
                    404
                );

            }


            // ---------------------------------------------
            // ลบไฟล์
            //
            // ImportService.deleteFile()
            // ต้องเป็นผู้จัดการ:
            //
            // 1. ล้างชื่อไฟล์จาก Database
            // 2. ลบไฟล์จริงจาก uploads
            // ---------------------------------------------

            const result =
                await ImportService.deleteFile(
                    id,
                    field
                );


            return success(
                res,

                result,

                200,

                "Import document deleted successfully"
            );

        } catch (
            err
        ) {

            const message =
                err?.message ||
                "";


            if (
                message ===
                "Import not found"
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
                400
            );

        }

    }
);


// =====================================================
// DELETE IMPORT
//
// DELETE:
//
// /api/imports/:id
//
// ROLE:
//
// ADMIN ONLY
//
// เหตุผล:
//
// การลบข้อมูล Import
// อาจส่งผลต่อ:
//
// - Stock
// - Movement
// - Dashboard
// - รายงาน
//
// ImportService.delete() จะจัดการ
// Flow เดิมของระบบ
//
// จึงให้ ADMIN เท่านั้นที่ลบได้
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
                        "Invalid import ID"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // ตรวจสอบก่อนลบ
            // ---------------------------------------------

            const old =
                await ImportService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Import not found"
                    ),
                    404
                );

            }


            // ---------------------------------------------
            // ลบข้อมูล
            //
            // ImportService เป็นผู้จัดการ:
            //
            // - Reverse Stock
            // - Delete Import
            // - Delete Physical Files
            //
            // ตาม Flow เดิมของระบบ
            // ---------------------------------------------

            const result =
                await ImportService.delete(
                    id
                );


            return success(
                res,

                {

                    id,

                    changes:
                        result?.changes ??
                        0

                },

                200,

                "Import deleted successfully"
            );

        } catch (
            err
        ) {

            const message =
                err?.message ||
                "";


            // ---------------------------------------------
            // กรณีไม่พบข้อมูล
            // ---------------------------------------------

            if (
                message ===
                "Import not found"
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
                400
            );

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports =
    router;