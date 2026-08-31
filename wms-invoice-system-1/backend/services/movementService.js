const {
    all,
    get
} =
    require("../config/database")


// =========================================================
// MOVEMENT SERVICE
//
// Path:
//
// backend/services/movementService.js
//
// =========================================================
//
// หน้าที่:
//
// จัดการการอ่านข้อมูลจาก:
//
// stock_movements
//
// Movement เป็นประวัติการเปลี่ยนแปลง Stock
//
// ตัวอย่าง:
//
// IMPORT
//     Stock เพิ่ม
//
// EXPORT
//     Stock ลด
//
// IMPORT EDIT
//     Reverse Stock เดิม
//     แล้ว Receive Stock ใหม่
//
// EXPORT EDIT
//     Reverse Stock เดิม
//     แล้ว Issue Stock ใหม่
//
// IMPORT DELETE
//     Reverse Receive
//
// EXPORT DELETE
//     Reverse Issue
//
// =========================================================
//
// IMPORTANT
//
// Service นี้เป็น READ SERVICE เป็นหลัก
//
// ไม่ควรใช้สร้าง Movement แบบอิสระ
//
// เพราะ Movement ที่ถูกต้องควรถูกสร้าง
// พร้อมกับการเปลี่ยนแปลง Stock
//
// ผ่าน:
//
// StockService.receive()
//
// StockService.issue()
//
// StockService.reverseReceive()
//
// StockService.reverseIssue()
//
// =========================================================


class MovementService {

    // =====================================================
    // NORMALIZE ID
    //
    // ตรวจสอบ ID ของ Movement
    //
    // ต้องเป็น:
    //
    // Integer
    // มากกว่า 0
    //
    // =====================================================

    normalizeId(
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
    // Product Number ของระบบ CWMS
    // ต้องเป็นตัวเลข
    //
    // ตัวอย่าง:
    //
    // 10001
    // 00001
    // 123456
    //
    // =====================================================

    normalizeProductCode(
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
    // NORMALIZE TEXT
    //
    // แปลงค่าเป็น String
    //
    // trim ช่องว่าง
    //
    // ถ้าไม่มีค่า:
    //
    // return ""
    //
    // =====================================================

    normalizeText(
        value
    ) {

        return String(
            value ??
            ""
        )
            .trim();

    }


    // =====================================================
    // NORMALIZE LIMIT
    //
    // ป้องกัน Query ดึงข้อมูลจำนวนมากเกินไป
    //
    // Default:
    //
    // 500
    //
    // Maximum:
    //
    // 5000
    //
    // =====================================================

    normalizeLimit(
        value
    ) {

        if (
            value ===
            undefined
            ||
            value ===
            null
            ||
            value ===
            ""
        ) {

            return 500;

        }


        const limit =
            Number(
                value
            );


        if (
            !Number.isInteger(
                limit
            )
            ||
            limit <= 0
        ) {

            return 500;

        }


        return Math.min(
            limit,
            5000
        );

    }


    // =====================================================
    // NORMALIZE PAGE
    //
    // Default:
    //
    // 1
    //
    // =====================================================

    normalizePage(
        value
    ) {

        if (
            value ===
            undefined
            ||
            value ===
            null
            ||
            value ===
            ""
        ) {

            return 1;

        }


        const page =
            Number(
                value
            );


        if (
            !Number.isInteger(
                page
            )
            ||
            page <= 0
        ) {

            return 1;

        }


        return page;

    }


    // =====================================================
    // BUILD WHERE
    //
    // สร้าง SQL WHERE
    //
    // รองรับ:
    //
    // product_code
    // product_number
    //
    // reference_no
    //
    // reference_type
    //
    // movement_type
    //
    // created_by
    //
    // date_from
    // from_date
    //
    // date_to
    // to_date
    //
    // =====================================================

    buildWhere(
        query = {}
    ) {

        const conditions =
            [];


        const params =
            [];


        // =================================================
        // PRODUCT CODE
        //
        // รองรับทั้ง:
        //
        // product_code
        //
        // product_number
        //
        // เพื่อให้เข้ากับ Frontend/Controller
        // หลายเวอร์ชัน
        // =================================================

        const productCode =
            this.normalizeText(
                query.product_code ||
                query.product_number
            );


        if (
            productCode
        ) {

            conditions.push(
                "product_code = ?"
            );


            params.push(
                productCode
            );

        }


        // =================================================
        // REFERENCE NO
        //
        // เช่น:
        //
        // IMP-001
        //
        // EXP-001
        // =================================================

        const referenceNo =
            this.normalizeText(
                query.reference_no
            );


        if (
            referenceNo
        ) {

            conditions.push(
                "reference_no = ?"
            );


            params.push(
                referenceNo
            );

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
        // =================================================

        const referenceType =
            this.normalizeText(
                query.reference_type
            );


        if (
            referenceType
        ) {

            conditions.push(
                "UPPER(reference_type) = UPPER(?)"
            );


            params.push(
                referenceType
            );

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
        //
        // ไม่บังคับเปลี่ยนค่าที่ส่งมา
        // เพราะต้องตรงกับ Database จริง
        // =================================================

        const movementType =
            this.normalizeText(
                query.movement_type
            );


        if (
            movementType
        ) {

            conditions.push(
                "UPPER(movement_type) = UPPER(?)"
            );


            params.push(
                movementType
            );

        }


        // =================================================
        // CREATED BY
        // =================================================

        const createdBy =
            this.normalizeText(
                query.created_by
            );


        if (
            createdBy
        ) {

            conditions.push(
                "created_by = ?"
            );


            params.push(
                createdBy
            );

        }


        // =================================================
        // DATE FROM
        //
        // รองรับ:
        //
        // date_from
        // from_date
        //
        // ใช้ date(created_at)
        //
        // เพื่อให้ Frontend ส่ง:
        //
        // YYYY-MM-DD
        //
        // ได้โดยตรง
        // =================================================

        const dateFrom =
            this.normalizeText(
                query.date_from ||
                query.from_date
            );


        if (
            dateFrom
        ) {

            conditions.push(
                "date(created_at) >= date(?)"
            );


            params.push(
                dateFrom
            );

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

        const dateTo =
            this.normalizeText(
                query.date_to ||
                query.to_date
            );


        if (
            dateTo
        ) {

            conditions.push(
                "date(created_at) <= date(?)"
            );


            params.push(
                dateTo
            );

        }


        return {

            conditions,

            params

        };

    }


    // =====================================================
    // GET ALL MOVEMENTS
    //
    // Method:
    //
    // MovementService.getAll(query)
    //
    // =====================================================
    //
    // ตัวอย่าง:
    //
    // getAll()
    //
    // getAll({
    //     product_code: "10001"
    // })
    //
    // getAll({
    //     reference_no: "IMP-001"
    // })
    //
    // getAll({
    //     movement_type: "IN"
    // })
    //
    // =====================================================

    async getAll(
        query = {}
    ) {

        // -------------------------------------------------
        // BUILD WHERE
        // -------------------------------------------------

        const {
            conditions,
            params
        } =
            this.buildWhere(
                query
            );


        // -------------------------------------------------
        // LIMIT
        //
        // Default 500
        // -------------------------------------------------

        const limit =
            this.normalizeLimit(
                query.limit
            );


        // -------------------------------------------------
        // PAGE
        // -------------------------------------------------

        const page =
            this.normalizePage(
                query.page
            );


        // -------------------------------------------------
        // OFFSET
        // -------------------------------------------------

        const offset =
            (
                page - 1
            )
            *
            limit;


        // -------------------------------------------------
        // WHERE SQL
        // -------------------------------------------------

        const whereSql =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";


        // -------------------------------------------------
        // SQL
        //
        // SELECT *
        //
        // ใช้เพื่อรักษา Column เดิม
        // ของ Schema และไม่ตัดข้อมูล
        // -------------------------------------------------

        const sql =
            `
                SELECT
                    *

                FROM
                    stock_movements

                ${whereSql}

                ORDER BY
                    created_at DESC,
                    id DESC

                LIMIT ?

                OFFSET ?
            `;


        // -------------------------------------------------
        // GET DATA
        // -------------------------------------------------

        const rows =
            await all(

                sql,

                [

                    ...params,

                    limit,

                    offset

                ]

            );


        // -------------------------------------------------
        // RETURN ARRAY
        //
        // Controller และ Frontend เดิม
        // สามารถใช้ Array ได้ทันที
        //
        // ไม่เปลี่ยน Response เป็น Object
        // เพื่อป้องกัน Frontend เก่าพัง
        // -------------------------------------------------

        return rows ||
            [];

    }


    // =====================================================
    // GET MOVEMENT BY ID
    //
    // Method:
    //
    // MovementService.getById(id)
    //
    // =====================================================

    async getById(
        id
    ) {

        const movementId =
            this.normalizeId(
                id
            );


        const sql =
            `
                SELECT
                    *

                FROM
                    stock_movements

                WHERE
                    id = ?

                LIMIT 1
            `;


        const row =
            await get(

                sql,

                [
                    movementId
                ]

            );


        // -------------------------------------------------
        // ถ้าไม่พบ
        //
        // return null
        //
        // Controller จะตอบ 404
        // -------------------------------------------------

        return row ||
            null;

    }


    // =====================================================
    // GET MOVEMENT BY PRODUCT
    //
    // Method:
    //
    // MovementService.getByProduct(productCode)
    //
    // =====================================================
    //
    // ค้นหาประวัติทั้งหมด
    // ของ Product Number เดียวกัน
    //
    // =====================================================

    async getByProduct(
        productCode,
        query = {}
    ) {

        const normalizedProductCode =
            this.normalizeProductCode(
                productCode
            );


        // -------------------------------------------------
        // เรียก getAll()
        //
        // เพื่อใช้:
        //
        // - Date Filter
        // - Movement Type Filter
        // - Pagination
        //
        // ได้ต่อไป
        // -------------------------------------------------

        return await this.getAll({

            ...query,

            product_code:
                normalizedProductCode

        });

    }


    // =====================================================
    // GET MOVEMENT BY REFERENCE
    //
    // Method:
    //
    // MovementService.getByReference(referenceNo)
    //
    // =====================================================
    //
    // ค้นหา Movement ตาม:
    //
    // Import Invoice
    //
    // Export Invoice
    //
    // Reference Number
    //
    // =====================================================

    async getByReference(
        referenceNo,
        query = {}
    ) {

        const normalizedReferenceNo =
            this.normalizeText(
                referenceNo
            );


        if (
            !normalizedReferenceNo
        ) {

            throw new Error(
                "Reference number is required"
            );

        }


        return await this.getAll({

            ...query,

            reference_no:
                normalizedReferenceNo

        });

    }


    // =====================================================
    // GET SUMMARY
    //
    // ใช้ภายในระบบ
    //
    // สามารถนำไปใช้ต่อกับ:
    //
    // Dashboard
    // Reports
    //
    // =====================================================
    //
    // Return:
    //
    // {
    //     total: 100,
    //     total_in: 50,
    //     total_out: 50
    // }
    //
    // =====================================================

    async getSummary(
        query = {}
    ) {

        const {
            conditions,
            params
        } =
            this.buildWhere(
                query
            );


        const whereSql =
            conditions.length > 0
                ? `WHERE ${conditions.join(" AND ")}`
                : "";


        const sql =
            `
                SELECT

                    COUNT(*) AS total,

                    COALESCE(

                        SUM(
                            CASE

                                WHEN
                                    UPPER(movement_type)
                                    IN (
                                        'IN',
                                        'RECEIVE'
                                    )

                                THEN
                                    qty

                                ELSE
                                    0

                            END
                        ),

                        0

                    ) AS total_in,

                    COALESCE(

                        SUM(
                            CASE

                                WHEN
                                    UPPER(movement_type)
                                    IN (
                                        'OUT',
                                        'ISSUE'
                                    )

                                THEN
                                    qty

                                ELSE
                                    0

                            END
                        ),

                        0

                    ) AS total_out

                FROM
                    stock_movements

                ${whereSql}
            `;


        const summary =
            await get(
                sql,
                params
            );


        return {

            total:
                Number(
                    summary?.total ||
                    0
                ),


            total_in:
                Number(
                    summary?.total_in ||
                    0
                ),


            total_out:
                Number(
                    summary?.total_out ||
                    0
                )

        };

    }

}


// =========================================================
// EXPORT
//
// Route / Controller ใช้งาน:
//
// const MovementService =
//     require("../services/movementService");
//
// =========================================================
//
// รองรับ:
//
// getAll(query)
//
// getById(id)
//
// getByProduct(productCode, query)
//
// getByReference(referenceNo, query)
//
// getSummary(query)
//
// =========================================================
//
// ไม่มี:
//
// create()
//
// update()
//
// delete()
//
// ผ่าน Public Movement API
//
// เพราะ Movement ต้องเกิดพร้อม Stock
//
// =========================================================

module.exports =
    new MovementService();