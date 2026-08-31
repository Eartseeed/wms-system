const StockService =
    require(
        "../services/stockService"
    );


// =====================================================
// STOCK CONTROLLER
//
// หน้าที่:
//
// รับ Request จาก:
//
// /api/stock
//
// แล้วส่งต่อไป:
//
// StockService
//
// =====================================================
//
// FLOW:
//
// Frontend
//
// ↓
//
// Stock Route
//
// ↓
//
// StockController
//
// ↓
//
// StockService
//
// ↓
//
// Database
//
// ↓
//
// Stock Movement
//
// =====================================================
//
// IMPORTANT
//
// Controller:
//
// - ไม่เขียน SQL โดยตรง
// - ไม่แก้ Stock โดยตรง
// - ส่ง Logic ไปให้ StockService
//
// StockService:
//
// - ควบคุมจำนวน Stock
// - สร้าง Movement
// - Receive Stock
// - Issue Stock
//
// =====================================================


// =====================================================
// SUCCESS RESPONSE
//
// รูปแบบ Response มาตรฐาน:
//
// {
//     success: true,
//
//     message: "...",
//
//     data: {}
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
// ทำให้ Error
// มีรูปแบบเดียวกัน
//
// ตัวอย่าง:
//
// {
//     success: false,
//
//     message:
//         "Stock not found"
// }
//
// =====================================================

function error(
    res,
    err,
    status = 400
) {

    console.error(
        "Stock Controller Error:",
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
                "Stock operation failed"

        });

}


// =====================================================
// NORMALIZE PRODUCT CODE
//
// Program 2:
//
// ไม่มี Product Master
//
// แต่ Product Number
// เป็นข้อมูลสำคัญ
//
// รับได้จาก:
//
// product_code
//
// หรือ:
//
// product_number
//
// =====================================================

function getProductCode(
    source = {}
) {

    return String(

        source.product_code ??

        source.product_number ??

        source.code ??

        ""

    )
        .trim();

}


// =====================================================
// NORMALIZE ID
//
// ใช้ตรวจ:
//
// Stock ID
//
// =====================================================

function getId(
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

        return null;

    }


    return id;

}


// =====================================================
// NORMALIZE NUMBER
//
// ป้องกัน:
//
// undefined
// null
// NaN
//
// =====================================================

function getNumber(
    value,
    fallback = 0
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : fallback;

}


// =====================================================
// STOCK CONTROLLER
// =====================================================

const StockController =
    {


        // =================================================
        // GET ALL STOCK
        //
        // GET:
        //
        // /api/stock
        //
        // =================================================
        //
        // ใช้สำหรับ:
        //
        // - Stock Management
        // - Stock Report
        // - Dashboard
        //
        // =================================================

        getAll:
            async (
                req,
                res
            ) => {

                try {

                    // -----------------------------------------
                    // ส่ง Query ต่อไปยัง Service
                    //
                    // รองรับในอนาคต:
                    //
                    // search
                    // warehouse
                    // limit
                    // page
                    //
                    // -----------------------------------------

                    const data =
                        await StockService.getAll(
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

            },


        // =================================================
        // GET STOCK BY PRODUCT
        //
        // GET:
        //
        // /api/stock/product/:productCode
        //
        // =================================================
        //
        // ตัวอย่าง:
        //
        // /api/stock/product/10001
        //
        // =================================================

        getByProduct:
            async (
                req,
                res
            ) => {

                try {

                    const productCode =
                        String(
                            req.params.productCode ??
                            ""
                        )
                            .trim();


                    // -----------------------------------------
                    // VALIDATE
                    // -----------------------------------------

                    if (
                        !productCode
                    ) {

                        return error(

                            res,

                            new Error(
                                "Product number is required"
                            ),

                            400

                        );

                    }


                    // -----------------------------------------
                    // GET STOCK
                    // -----------------------------------------

                    const data =
                        await StockService.getByProduct(
                            productCode
                        );


                    // -----------------------------------------
                    // NOT FOUND
                    //
                    // StockService อาจ return:
                    //
                    // null
                    // undefined
                    // []
                    //
                    // จึงรองรับทั้งหมด
                    // -----------------------------------------

                    if (
                        !data
                    ) {

                        return error(

                            res,

                            new Error(
                                "Stock not found"
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

            },


        // =================================================
        // CREATE STOCK
        //
        // POST:
        //
        // /api/stock
        //
        // =================================================
        //
        // IMPORTANT
        //
        // Route นี้ใช้สำหรับ
        // สร้าง Stock Record โดยตรง
        //
        // แต่ไม่ควรใช้แทน:
        //
        // Import Invoice
        //
        // เพราะ Import Invoice ต้องใช้:
        //
        // ImportService
        //
        // =================================================

        create:
            async (
                req,
                res
            ) => {

                try {

                    const body =
                        req.body ||
                        {};


                    const productCode =
                        getProductCode(
                            body
                        );


                    // -----------------------------------------
                    // VALIDATE PRODUCT
                    // -----------------------------------------

                    if (
                        !productCode
                    ) {

                        return error(

                            res,

                            new Error(
                                "Product number is required"
                            ),

                            400

                        );

                    }


                    // -----------------------------------------
                    // DATA
                    //
                    // ใช้ req.user จาก authenticate
                    //
                    // เพื่อบันทึกว่า:
                    //
                    // ใครสร้าง Stock
                    // -----------------------------------------

                    const data =
                        {

                            ...body,


                            product_code:
                                productCode,


                            created_by:
                                req.user?.username ||
                                body.created_by ||
                                ""

                        };


                    // -----------------------------------------
                    // CREATE
                    // -----------------------------------------

                    const result =
                        await StockService.create(
                            data
                        );


                    return success(

                        res,

                        result,

                        201,

                        "Stock created successfully"

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

            },


        // =================================================
        // RECEIVE STOCK
        //
        // POST:
        //
        // /api/stock/receive
        //
        // =================================================
        //
        // Body:
        //
        // {
        //
        //     product_code: "10001",
        //
        //     qty: 10,
        //
        //     product_name: "Product A",
        //
        //     warehouse_id: 1,
        //
        //     location: "A-01",
        //
        //     remark: "Manual receive"
        //
        // }
        //
        // =================================================
        //
        // FLOW:
        //
        // Controller
        //
        // ↓
        //
        // StockService.receive()
        //
        // ↓
        //
        // เพิ่ม Stock
        //
        // ↓
        //
        // สร้าง Movement
        //
        // =================================================

        receive:
            async (
                req,
                res
            ) => {

                try {

                    const body =
                        req.body ||
                        {};


                    const productCode =
                        getProductCode(
                            body
                        );


                    const qty =
                        getNumber(
                            body.qty
                        );


                    // -----------------------------------------
                    // VALIDATE PRODUCT
                    // -----------------------------------------

                    if (
                        !productCode
                    ) {

                        return error(

                            res,

                            new Error(
                                "Product number is required"
                            ),

                            400

                        );

                    }


                    // -----------------------------------------
                    // VALIDATE QTY
                    // -----------------------------------------

                    if (
                        qty <= 0
                    ) {

                        return error(

                            res,

                            new Error(
                                "Quantity must be greater than 0"
                            ),

                            400

                        );

                    }


                    // -----------------------------------------
                    // OPTIONS
                    //
                    // ส่งข้อมูล Stock
                    // ไปให้ Service
                    // -----------------------------------------

                    const options =
                        {

                            ...body,


                            product_code:
                                productCode,


                            qty,


                            // ---------------------------------
                            // USER
                            //
                            // มาจาก JWT
                            // ---------------------------------

                            created_by:
                                req.user?.username ||
                                body.created_by ||
                                "",


                            // ---------------------------------
                            // DEFAULT
                            //
                            // ถ้าไม่ได้ส่งมา
                            // ให้เป็น Manual Receive
                            // ---------------------------------

                            reference_type:
                                body.reference_type ||
                                "MANUAL_RECEIVE",


                            reference_no:
                                body.reference_no ||
                                "",


                            movement_no:
                                body.movement_no ||
                                "",


                            remark:
                                body.remark ||
                                "Manual stock receive"

                        };


                    // -----------------------------------------
                    // RECEIVE STOCK
                    //
                    // IMPORTANT
                    //
                    // ส่ง:
                    //
                    // productCode
                    // qty
                    // options
                    //
                    // ให้ตรงกับ ImportService
                    //
                    // -----------------------------------------

                    const result =
                        await StockService.receive(

                            productCode,

                            qty,

                            options

                        );


                    return success(

                        res,

                        result,

                        200,

                        "Stock received successfully"

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

            },


        // =================================================
        // ISSUE STOCK
        //
        // POST:
        //
        // /api/stock/issue
        //
        // =================================================
        //
        // Body:
        //
        // {
        //
        //     product_code: "10001",
        //
        //     qty: 5,
        //
        //     remark: "Manual issue"
        //
        // }
        //
        // =================================================
        //
        // FLOW:
        //
        // Controller
        //
        // ↓
        //
        // StockService.issue()
        //
        // ↓
        //
        // ตรวจสอบ Stock
        //
        // ↓
        //
        // ลด Stock
        //
        // ↓
        //
        // สร้าง Movement
        //
        // =================================================

        issue:
            async (
                req,
                res
            ) => {

                try {

                    const body =
                        req.body ||
                        {};


                    const productCode =
                        getProductCode(
                            body
                        );


                    const qty =
                        getNumber(
                            body.qty
                        );


                    // -----------------------------------------
                    // VALIDATE PRODUCT
                    // -----------------------------------------

                    if (
                        !productCode
                    ) {

                        return error(

                            res,

                            new Error(
                                "Product number is required"
                            ),

                            400

                        );

                    }


                    // -----------------------------------------
                    // VALIDATE QTY
                    // -----------------------------------------

                    if (
                        qty <= 0
                    ) {

                        return error(

                            res,

                            new Error(
                                "Quantity must be greater than 0"
                            ),

                            400

                        );

                    }


                    // -----------------------------------------
                    // OPTIONS
                    //
                    // Program 2
                    //
                    // ไม่มี Product Master
                    //
                    // ใช้ Product Number
                    // เป็นตัวระบุสินค้า
                    //
                    // -----------------------------------------

                    const options =
                        {

                            ...body,


                            product_code:
                                productCode,


                            qty,


                            // ---------------------------------
                            // USER
                            //
                            // ผู้ทำรายการ
                            // ---------------------------------

                            created_by:
                                req.user?.username ||
                                body.created_by ||
                                "",


                            // ---------------------------------
                            // DEFAULT
                            // ---------------------------------

                            reference_type:
                                body.reference_type ||
                                "MANUAL_ISSUE",


                            reference_no:
                                body.reference_no ||
                                "",


                            movement_no:
                                body.movement_no ||
                                "",


                            remark:
                                body.remark ||
                                "Manual stock issue"

                        };


                    // -----------------------------------------
                    // ISSUE STOCK
                    // -----------------------------------------

                    const result =
                        await StockService.issue(

                            productCode,

                            qty,

                            options

                        );


                    return success(

                        res,

                        result,

                        200,

                        "Stock issued successfully"

                    );

                } catch (
                    err
                ) {

                    // -----------------------------------------
                    // Stock ไม่เพียงพอ
                    //
                    // ให้ Service ส่ง Error มา
                    //
                    // Controller ตอบ:
                    //
                    // 400
                    //
                    // ไม่ใช้ 500
                    //
                    // เพราะเป็น Business Error
                    // -----------------------------------------

                    return error(
                        res,
                        err,
                        400
                    );

                }

            }

    };


// =====================================================
// EXPORT
// =====================================================

module.exports =
    StockController;