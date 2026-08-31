const express =
    require(
        "express"
    );


// =====================================================
// ROUTER
//
// Route นี้ถูกใช้งานผ่าน:
//
// /api/suppliers
// =====================================================

const router =
    express.Router();


// =====================================================
// SUPPLIER SERVICE
//
// ใช้ Service เดิมของระบบ
//
// หน้าที่:
//
// - ดึง Supplier ทั้งหมด
// - ดึง Supplier ตาม ID
// - สร้าง Supplier
// - แก้ไข Supplier
// - ลบ Supplier
// =====================================================

const SupplierService =
    require(
        "../services/supplierService"
    );


// =====================================================
// AUTH MIDDLEWARE
//
// authenticate
//     ตรวจสอบ Token และ User Login
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
// หมายเหตุ:
//
// Supplier ถูกใช้ใน Import Invoice
// จึงอนุญาตให้ EMPLOYEE สร้าง Supplier ใหม่ได้
//
// แต่ห้ามแก้ไขหรือลบข้อมูล Supplier เดิม
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
// SUCCESS RESPONSE
//
// รูปแบบ Response:
//
// {
//     success: true,
//     message: "...",
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
// รูปแบบ:
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
        "Supplier API Error:",
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
                "Supplier operation failed"

        });

}


// =====================================================
// VALIDATE ID
//
// ตรวจสอบว่า ID:
//
// - เป็น Number
// - เป็น Integer
// - มากกว่า 0
// =====================================================

function getValidId(
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
            "Invalid supplier ID"
        );

    }


    return id;

}


// =====================================================
// NORMALIZE SUPPLIER DATA
//
// รองรับข้อมูลจาก Frontend
//
// supplier_name
// phone
// address
//
// Trim ก่อนส่งเข้า Service
//
// IMPORTANT:
//
// ไม่ลบ Field อื่นจากข้อมูลเดิม
// =====================================================

function normalizeSupplierData(
    body = {}
) {

    return {

        ...body,


        supplier_name:
            String(
                body.supplier_name ||
                ""
            )
                .trim(),


        phone:
            String(
                body.phone ||
                ""
            )
                .trim(),


        address:
            String(
                body.address ||
                ""
            )
                .trim()

    };

}


// =====================================================
// ALL SUPPLIER ROUTES REQUIRE LOGIN
//
// ทุก Route ต้อง Login ก่อน
//
// authenticate จะสร้าง:
//
// req.user
//
// เช่น:
//
// {
//     id: 1,
//     username: "admin",
//     fullname: "System Admin",
//     role: "ADMIN"
// }
// =====================================================

router.use(
    authenticate
);


// =====================================================
// GET ALL SUPPLIERS
//
// GET:
//
// /api/suppliers
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทุก Role ดูข้อมูลได้
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
                await SupplierService.getAll();


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
// GET SUPPLIER BY ID
//
// GET:
//
// /api/suppliers/:id
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
                getValidId(
                    req.params.id
                );


            const data =
                await SupplierService.getById(
                    id
                );


            if (
                !data
            ) {

                return error(
                    res,
                    new Error(
                        "Supplier not found"
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

            const status =
                err?.message ===
                "Invalid supplier ID"

                    ? 400

                    : 500;


            return error(
                res,
                err,
                status
            );

        }

    }
);


// =====================================================
// CREATE SUPPLIER
//
// POST:
//
// /api/suppliers
//
// ROLE:
//
// ADMIN
// SUPERVISOR
// EMPLOYEE
//
// ทุก Role สามารถเพิ่ม Supplier ได้
//
// เพราะตอนสร้าง Import ใหม่
// อาจต้องเพิ่ม Supplier ใหม่ทันที
// =====================================================

router.post(
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
                normalizeSupplierData(
                    req.body
                );


            // ---------------------------------------------
            // VALIDATE
            // ---------------------------------------------

            if (
                !data.supplier_name
            ) {

                return error(
                    res,
                    new Error(
                        "Supplier name is required"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // CREATE
            // ---------------------------------------------

            const result =
                await SupplierService.create(
                    data
                );


            return success(
                res,

                result,

                201,

                "Supplier created successfully"
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
// UPDATE SUPPLIER
//
// PUT:
//
// /api/suppliers/:id
//
// ROLE:
//
// ADMIN
// SUPERVISOR
//
// EMPLOYEE:
//
// ไม่มีสิทธิ์แก้ Supplier เดิม
// =====================================================

router.put(
    "/:id",

    authorize(
        ...ROLE.EDIT
    ),

    async (
        req,
        res
    ) => {

        try {

            const id =
                getValidId(
                    req.params.id
                );


            // ---------------------------------------------
            // ตรวจสอบ Supplier เดิม
            // ---------------------------------------------

            const old =
                await SupplierService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Supplier not found"
                    ),
                    404
                );

            }


            const data =
                normalizeSupplierData(
                    req.body
                );


            // ---------------------------------------------
            // ตรวจสอบชื่อ
            // ---------------------------------------------

            if (
                !data.supplier_name
            ) {

                return error(
                    res,
                    new Error(
                        "Supplier name is required"
                    ),
                    400
                );

            }


            // ---------------------------------------------
            // UPDATE
            // ---------------------------------------------

            const result =
                await SupplierService.update(
                    id,
                    data
                );


            return success(
                res,

                result,

                200,

                "Supplier updated successfully"
            );

        } catch (
            err
        ) {

            const status =
                err?.message ===
                "Supplier not found"

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
// DELETE SUPPLIER
//
// DELETE:
//
// /api/suppliers/:id
//
// ROLE:
//
// ADMIN ONLY
//
// เหตุผล:
//
// Supplier อาจถูกใช้งานกับ Import Invoice แล้ว
//
// การลบข้อมูลหลักควรจำกัด ADMIN
//
// ถ้า Supplier ถูกใช้งานอยู่
// Service / Database สามารถป้องกันการลบต่อได้
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
                getValidId(
                    req.params.id
                );


            // ---------------------------------------------
            // ตรวจสอบ Supplier
            // ---------------------------------------------

            const old =
                await SupplierService.getById(
                    id
                );


            if (
                !old
            ) {

                return error(
                    res,
                    new Error(
                        "Supplier not found"
                    ),
                    404
                );

            }


            // ---------------------------------------------
            // DELETE
            // ---------------------------------------------

            const result =
                await SupplierService.delete(
                    id
                );


            return success(
                res,

                result,

                200,

                "Supplier deleted successfully"
            );

        } catch (
            err
        ) {

            const status =
                err?.message ===
                "Supplier not found"

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