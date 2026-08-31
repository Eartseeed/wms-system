const MovementService =
    require(
        "../services/movementService"
    );


// =====================================================
// MOVEMENT CONTROLLER
//
// Path:
//
// backend/controllers/movementController.js
//
// =====================================================
//
// หน้าที่:
//
// Controller รับ Request จาก:
//
// backend/routes/movement.js
//
// แล้วส่งต่อไป:
//
// backend/services/movementService.js
//
// Flow:
//
// Route
// ↓
// MovementController
// ↓
// MovementService
// ↓
// Database
//
// =====================================================
//
// IMPORTANT
//
// Movement เป็นประวัติการเปลี่ยนแปลง Stock
//
// เช่น:
//
// IMPORT
// ↓
// StockService.receive()
// ↓
// Stock เพิ่ม
// ↓
// Stock Movement
//
// EXPORT
// ↓
// StockService.issue()
// ↓
// Stock ลด
// ↓
// Stock Movement
//
// เพราะฉะนั้น Controller นี้มีหน้าที่:
//
// - ดู Movement
// - ค้นหา Movement
// - Filter Movement
// - ดูตาม Product
// - ดูตาม Reference
//
// ไม่มีหน้าที่:
//
// - เพิ่ม Stock
// - ลด Stock
// - แก้ Movement โดยตรง
// - ลบ Movement โดยตรง
//
// =====================================================


// =====================================================
// SUCCESS RESPONSE
//
// ทำให้ Response ของ Controller
// มีรูปแบบเดียวกัน
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
//     message: "Movement loaded successfully",
//     data: []
// }
//
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


            // ---------------------------------------------
            // ถ้ามี Message
            // จึงเพิ่มลงใน Response
            // ---------------------------------------------

            ...(message
                ? {

                    message

                }
                : {}),


            // ---------------------------------------------
            // ข้อมูลหลัก
            // ---------------------------------------------

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
//     message: "Error message"
// }
//
// =====================================================
//
// Log Error ที่ Backend
// เพื่อช่วยตรวจสอบปัญหา
//
// =====================================================

function error(
    res,
    err,
    status = 400
) {

    console.error(
        "Movement Controller Error:",
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
// NORMALIZE ID
//
// รับ:
//
// req.params.id
//
// ตรวจสอบว่า:
//
// - ต้องเป็น Number
// - ต้องเป็น Integer
// - ต้องมากกว่า 0
//
// ตัวอย่างที่ถูกต้อง:
//
// 1
// 2
// 100
//
// ตัวอย่างที่ผิด:
//
// abc
// 0
// -1
//
// =====================================================

function normalizeId(
    value
) {

    const id =
        Number(
            value
        );


    if (
        !Number.isInteger(
            id
        )
        ||
        id <= 0
    ) {

        throw new Error(
            "Invalid movement ID"
        );

    }


    return id;

}


// =====================================================
// NORMALIZE PRODUCT CODE
//
// ระบบ CWMS ปัจจุบัน:
//
// ไม่มี Product Master แยก
//
// Product Number ต้องเป็นตัวเลข
//
// ตัวอย่าง:
//
// 10001
// 12345
// 00001
//
// รองรับ:
//
// product_code
// product_number
//
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


    // ---------------------------------------------
    // ห้ามว่าง
    // ---------------------------------------------

    if (
        !productCode
    ) {

        throw new Error(
            "Product number is required"
        );

    }


    // ---------------------------------------------
    // Product Number
    // ต้องเป็นตัวเลขเท่านั้น
    // ---------------------------------------------

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
// Reference สามารถเป็น:
//
// Import Invoice
// Export Invoice
// Movement Number
//
// ตัวอย่าง:
//
// IMP-001
// EXP-001
// IMP-1
// EXP-1
//
// ไม่จำเป็นต้องเป็นตัวเลข
//
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
// BUILD QUERY
//
// รับ Query จาก:
//
// req.query
//
// แล้วสร้าง Filter ส่งต่อไป:
//
// MovementService.getAll()
//
// =====================================================
//
// รองรับ:
//
// product_code
// product_number
// reference_no
// reference_type
// movement_type
// created_by
// date_from
// date_to
// from_date
// to_date
// limit
// page
//
// =====================================================
//
// IMPORTANT
//
// Controller จะไม่ตัด Query เดิมทิ้ง
//
// เพื่อรักษาความสามารถของ Frontend
//
// และรองรับ Query ใหม่ในอนาคต
//
// =====================================================

function buildQuery(
    query = {}
) {

    const result =
        {

            ...query

        };


    // =================================================
    // PRODUCT CODE
    //
    // รองรับชื่อเดิม:
    //
    // product_code
    //
    // และ:
    //
    // product_number
    //
    // =================================================

    if (
        query.product_code !==
        undefined
    ) {

        const value =
            String(
                query.product_code ??
                ""
            )
                .trim();


        if (
            value
        ) {

            result.product_code =
                value;

        }

    }


    if (
        query.product_number !==
        undefined
    ) {

        const value =
            String(
                query.product_number ??
                ""
            )
                .trim();


        if (
            value
        ) {

            result.product_number =
                value;

        }

    }


    // =================================================
    // REFERENCE NUMBER
    // =================================================

    if (
        query.reference_no !==
        undefined
    ) {

        result.reference_no =
            String(
                query.reference_no ??
                ""
            )
                .trim();

    }


    // =================================================
    // REFERENCE TYPE
    //
    // ตัวอย่าง:
    //
    // IMPORT
    // EXPORT
    // IMPORT_EDIT
    // EXPORT_EDIT
    // IMPORT_DELETE
    // EXPORT_DELETE
    //
    // =================================================

    if (
        query.reference_type !==
        undefined
    ) {

        result.reference_type =
            String(
                query.reference_type ??
                ""
            )
                .trim();

    }


    // =================================================
    // MOVEMENT TYPE
    //
    // ตัวอย่าง:
    //
    // IN
    // OUT
    // RECEIVE
    // ISSUE
    // REVERSE
    //
    // =================================================

    if (
        query.movement_type !==
        undefined
    ) {

        result.movement_type =
            String(
                query.movement_type ??
                ""
            )
                .trim();

    }


    // =================================================
    // CREATED BY
    // =================================================

    if (
        query.created_by !==
        undefined
    ) {

        result.created_by =
            String(
                query.created_by ??
                ""
            )
                .trim();

    }


    // =================================================
    // DATE FROM
    //
    // รองรับ:
    //
    // date_from
    // from_date
    //
    // =================================================

    if (
        query.date_from !==
        undefined
    ) {

        result.date_from =
            String(
                query.date_from ??
                ""
            )
                .trim();

    }


    if (
        query.from_date !==
        undefined
    ) {

        result.from_date =
            String(
                query.from_date ??
                ""
            )
                .trim();

    }


    // =================================================
    // DATE TO
    //
    // รองรับ:
    //
    // date_to
    // to_date
    //
    // =================================================

    if (
        query.date_to !==
        undefined
    ) {

        result.date_to =
            String(
                query.date_to ??
                ""
            )
                .trim();

    }


    if (
        query.to_date !==
        undefined
    ) {

        result.to_date =
            String(
                query.to_date ??
                ""
            )
                .trim();

    }


    // =================================================
    // LIMIT
    //
    // ถ้าส่งมา:
    //
    // /api/movement?limit=100
    //
    // จะส่ง Number 100 ไป Service
    //
    // =================================================

    if (
        query.limit !==
        undefined
        &&
        query.limit !==
        ""
    ) {

        const limit =
            Number(
                query.limit
            );


        if (
            Number.isInteger(
                limit
            )
            &&
            limit > 0
        ) {

            result.limit =
                limit;

        }

    }


    // =================================================
    // PAGE
    //
    // รองรับ Pagination ในอนาคต
    //
    // =================================================

    if (
        query.page !==
        undefined
        &&
        query.page !==
        ""
    ) {

        const page =
            Number(
                query.page
            );


        if (
            Number.isInteger(
                page
            )
            &&
            page > 0
        ) {

            result.page =
                page;

        }

    }


    return result;

}


// =====================================================
// GET ALL MOVEMENTS
//
// Route:
//
// GET /api/movement
//
// =====================================================
//
// ตัวอย่าง:
//
// /api/movement
//
// /api/movement?limit=100
//
// /api/movement?product_code=10001
//
// /api/movement?reference_type=IMPORT
//
// /api/movement?date_from=2026-01-01
//
// =====================================================
//
// Flow:
//
// Route
// ↓
// getAll()
// ↓
// buildQuery(req.query)
// ↓
// MovementService.getAll(query)
// ↓
// Database
//
// =====================================================

const getAll =
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // ตรวจสอบว่า Service มี Method นี้จริง
            // ---------------------------------------------

            if (
                typeof MovementService.getAll !==
                "function"
            ) {

                throw new Error(
                    "MovementService.getAll is not implemented"
                );

            }


            // ---------------------------------------------
            // Build Query
            // ---------------------------------------------

            const query =
                buildQuery(
                    req.query
                );


            // ---------------------------------------------
            // GET DATA
            // ---------------------------------------------

            const data =
                await MovementService.getAll(
                    query
                );


            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            return success(
                res,
                data,
                200
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

    };


// =====================================================
// GET MOVEMENT BY ID
//
// Route:
//
// GET /api/movement/:id
//
// ตัวอย่าง:
//
// GET /api/movement/1
//
// =====================================================

const getById =
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // ตรวจสอบ ID
            // ---------------------------------------------

            const id =
                normalizeId(
                    req.params.id
                );


            // ---------------------------------------------
            // ตรวจสอบ Service
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
            // GET DATA
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


            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            return success(
                res,
                data,
                200
            );

        } catch (
            err
        ) {

            // ---------------------------------------------
            // Invalid ID
            // ---------------------------------------------

            if (
                err?.message ===
                "Invalid movement ID"
            ) {

                return error(
                    res,
                    err,
                    400
                );

            }


            // ---------------------------------------------
            // Not Found
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

    };


// =====================================================
// GET MOVEMENT BY PRODUCT
//
// Route:
//
// GET /api/movement/product/:productCode
//
// ตัวอย่าง:
//
// GET /api/movement/product/10001
//
// =====================================================
//
// Flow:
//
// Product Number
// ↓
// Validate
// ↓
// MovementService.getByProduct()
// ↓
// Database
//
// =====================================================

const getByProduct =
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // Route ใหม่ใช้:
            //
            // :productCode
            //
            // รองรับชื่อเก่า:
            //
            // :productId
            //
            // เพื่อไม่ให้ Frontend / Route เก่าพัง
            // ---------------------------------------------

            const productCode =
                normalizeProductCode(

                    req.params.productCode ??
                    req.params.productId

                );


            let data;


            // ---------------------------------------------
            // ถ้า Service มี getByProduct()
            //
            // ใช้ Method นี้โดยตรง
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
            // Fallback
            //
            // ถ้า Service ยังไม่มี Method
            //
            // ใช้ getAll()
            // พร้อมส่ง Product Filter
            // ---------------------------------------------

            else {

                if (
                    typeof MovementService.getAll !==
                    "function"
                ) {

                    throw new Error(
                        "MovementService.getAll is not implemented"
                    );

                }


                data =
                    await MovementService.getAll({

                        ...buildQuery(
                            req.query
                        ),


                        product_code:
                            productCode,


                        product_number:
                            productCode

                    });

            }


            return success(
                res,
                data,
                200
            );

        } catch (
            err
        ) {

            // ---------------------------------------------
            // Validation Error
            // ---------------------------------------------

            if (
                err?.message ===
                "Product number is required"
                ||
                err?.message ===
                "Product number must contain numbers only"
            ) {

                return error(
                    res,
                    err,
                    400
                );

            }


            return error(
                res,
                err,
                500
            );

        }

    };


// =====================================================
// GET MOVEMENT BY REFERENCE
//
// Route:
//
// GET /api/movement/reference/:referenceNo
//
// ตัวอย่าง:
//
// GET /api/movement/reference/IMP-001
//
// GET /api/movement/reference/EXP-001
//
// =====================================================
//
// ใช้ค้นหา:
//
// - Import Invoice
// - Export Invoice
// - Reference Number
//
// =====================================================

const getByReference =
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------------------
            // Validate Reference
            // ---------------------------------------------

            const referenceNo =
                normalizeReferenceNo(
                    req.params.referenceNo
                );


            let data;


            // ---------------------------------------------
            // ถ้า Service มี:
            //
            // getByReference()
            //
            // ให้ใช้โดยตรง
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
            // Fallback
            //
            // ใช้ getAll()
            //
            // พร้อม Filter
            //
            // reference_no
            // ---------------------------------------------

            else {

                if (
                    typeof MovementService.getAll !==
                    "function"
                ) {

                    throw new Error(
                        "MovementService.getAll is not implemented"
                    );

                }


                data =
                    await MovementService.getAll({

                        ...buildQuery(
                            req.query
                        ),


                        reference_no:
                            referenceNo

                    });

            }


            return success(
                res,
                data,
                200
            );

        } catch (
            err
        ) {

            if (
                err?.message ===
                "Reference number is required"
            ) {

                return error(
                    res,
                    err,
                    400
                );

            }


            return error(
                res,
                err,
                500
            );

        }

    };


// =====================================================
// EXPORT CONTROLLER
//
// Route ใช้งาน:
//
// MovementController.getAll
//
// MovementController.getByProduct
//
// MovementController.getByReference
//
// MovementController.getById
//
// =====================================================
//
// IMPORTANT
//
// ไม่มี:
//
// create
// update
// delete
//
// ผ่าน Public Movement API
//
// เพราะ Movement ต้องถูกสร้างจาก:
//
// StockService.receive()
// StockService.issue()
// StockService.reverseReceive()
// StockService.reverseIssue()
//
// =====================================================

module.exports =
    {

        getAll,

        getByProduct,

        getByReference,

        getById

    };