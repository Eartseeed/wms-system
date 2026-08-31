const {
    get,
    all
} =
    require(
        "../config/database"
    );


// =====================================================
// DASHBOARD CONTROLLER
//
// หน้าที่:
//
// 1. Total Import
// 2. Total Export
// 3. Current Stock
// 4. Total Weight
// 5. Import Value
// 6. Export Value
// 7. Balance Value
// 8. Suppliers
// 9. Users
//
// รวมถึง:
//
// - Recent Import
// - Recent Export
// - Import Pages
// - Export Pages
//
// =====================================================
//
// IMPORTANT FLOW
//
// IMPORT
// imports
//     ↓
// STOCK +
//     ↓
// DASHBOARD
//
// EXPORT
// export_invoice
//     ↓
// StockService.issue()
//     ↓
// STOCK -
//     ↓
// DASHBOARD
//
// =====================================================
//
// IMPORTANT
//
// Summary Cards:
//
// - Current Stock
// - Total Weight
// - Import Value
// - Export Value
// - Balance Value
//
// จะใช้ข้อมูล Current / Total
// ไม่ถูกลดด้วย Date Filter
//
// เพราะ Date Filter ใช้สำหรับดูช่วงเวลา
// ของ Recent Import / Recent Export
//
// =====================================================


// =====================================================
// PAGINATION SIZE
//
// จำนวนรายการต่อหน้า
// =====================================================

const PAGE_SIZE =
    10;


// =====================================================
// NORMALIZE DATE
//
// รองรับ:
//
// YYYY-MM-DD
//
// ถ้าไม่ถูกต้อง:
// return ""
// =====================================================

function normalizeDate(
    value
) {

    const date =
        String(
            value ??
            ""
        )
            .trim();


    if (
        !date
    ) {

        return "";

    }


    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            date
        )
    ) {

        return "";

    }


    return date;

}


// =====================================================
// NORMALIZE PAGE
//
// ?page=1
//
// ถ้าไม่ถูกต้อง:
// ใช้หน้า 1
// =====================================================

function normalizePage(
    value
) {

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
// BUILD DATE WHERE
//
// ใช้เฉพาะ:
//
// - Recent Import
// - Recent Export
// - Import Pages
// - Export Pages
//
// ไม่ใช้กับ Summary Cards
// ที่ต้องการยอดรวมทั้งหมด
// =====================================================

function buildDateWhere(
    column,
    dateFrom,
    dateTo
) {

    const where =
        [];

    const params =
        [];


    // -------------------------------------------------
    // DATE FROM
    // -------------------------------------------------

    if (
        dateFrom
    ) {

        where.push(
            `date(${column}) >= date(?)`
        );

        params.push(
            dateFrom
        );

    }


    // -------------------------------------------------
    // DATE TO
    // -------------------------------------------------

    if (
        dateTo
    ) {

        where.push(
            `date(${column}) <= date(?)`
        );

        params.push(
            dateTo
        );

    }


    return {

        sql:
            where.length > 0

                ? `WHERE ${where.join(" AND ")}`

                : "",

        params

    };

}


// =====================================================
// SAFE NUMBER
//
// ป้องกัน:
//
// null
// undefined
// NaN
// Infinity
// =====================================================

function number(
    value
) {

    const result =
        Number(
            value
        );


    return Number.isFinite(
        result
    )

        ? result

        : 0;

}


// =====================================================
// DASHBOARD CONTROLLER
// =====================================================

const DashboardController =
    {


// =====================================================
// GET SUMMARY
//
// GET:
//
// /api/dashboard
// /api/dashboard/summary
//
// =====================================================
//
// SUMMARY CARD
//
// 1. Total Import
// 2. Total Export
// 3. Current Stock
// 4. Total Weight
// 5. Import Value
// 6. Export Value
// 7. Balance Value
// 8. Suppliers
// 9. Users
//
// =====================================================
//
// IMPORTANT
//
// Summary ทั้ง 9 ตัวนี้
// ไม่ใช้ Date Filter
//
// เหตุผล:
//
// Current Stock = ยอดปัจจุบัน
//
// Total Weight = น้ำหนัก Stock ปัจจุบัน
//
// Import Value = มูลค่า Import ทั้งหมด
//
// Export Value = มูลค่า Export ทั้งหมด
//
// Balance Value = Import Value - Export Value
//
// ดังนั้นเมื่อ User เปลี่ยน Date
// Summary Card จะไม่กลายเป็น 0
// เพียงเพราะวันที่เลือกไม่มี Invoice
//
// Date Filter จะยังคงใช้กับ:
//
// - Recent Import
// - Recent Export
// - Pagination
//
// =====================================================

        getSummary:
            async (
                req,
                res
            ) => {

                try {


                    // =========================================
                    // IMPORT SUMMARY
                    //
                    // ตาราง:
                    //
                    // imports
                    //
                    // ไม่ใช้ Date Filter
                    //
                    // เพราะ Card ต้องแสดง
                    // Import ทั้งหมด
                    // =========================================

                    const importSummary =
                        await get(
                            `
                                SELECT

                                    COUNT(*) AS totalImport,

                                    COALESCE(
                                        SUM(qty),
                                        0
                                    ) AS totalImportQty,

                                    COALESCE(
                                        SUM(total_price),
                                        0
                                    ) AS importAmount

                                FROM imports
                            `
                        );


                    // =========================================
                    // EXPORT SUMMARY
                    //
                    // ตาราง:
                    //
                    // export_invoice
                    //
                    // ไม่ใช้ Date Filter
                    //
                    // เพราะ Card ต้องแสดง
                    // Export ทั้งหมด
                    //
                    // IMPORTANT
                    //
                    // ห้ามเปลี่ยนกลับไปใช้:
                    //
                    // exports
                    //
                    // เพราะ Project ปัจจุบันใช้:
                    //
                    // export_invoice
                    // =========================================

                    const exportSummary =
                        await get(
                            `
                                SELECT

                                    COUNT(*) AS totalExport,

                                    COALESCE(
                                        SUM(qty),
                                        0
                                    ) AS totalExportQty,

                                    COALESCE(
                                        SUM(total_price),
                                        0
                                    ) AS exportAmount

                                FROM export_invoice
                            `
                        );


                    // =========================================
                    // STOCK SUMMARY
                    //
                    // ตาราง:
                    //
                    // stock
                    //
                    // Current Stock:
                    // SUM(qty)
                    //
                    // Total Weight:
                    // SUM(total_weight)
                    //
                    // Stock Value:
                    // qty × unit_cost
                    //
                    // ไม่ใช้ Date Filter
                    //
                    // เพราะ Stock คือ Current State
                    // =========================================

                    const stockSummary =
                        await get(
                            `
                                SELECT

                                    COUNT(*) AS totalStock,

                                    COALESCE(
                                        SUM(qty),
                                        0
                                    ) AS totalStockQty,

                                    COALESCE(
                                        SUM(total_weight),
                                        0
                                    ) AS totalStockWeight,

                                    COALESCE(
                                        SUM(
                                            qty *
                                            COALESCE(
                                                unit_cost,
                                                0
                                            )
                                        ),
                                        0
                                    ) AS totalStockValue

                                FROM stock
                            `
                        );


                    // =========================================
                    // SUPPLIER SUMMARY
                    //
                    // Current Master Data
                    // =========================================

                    const supplierSummary =
                        await get(
                            `
                                SELECT

                                    COUNT(*) AS totalSuppliers

                                FROM suppliers
                            `
                        );


                    // =========================================
                    // USER SUMMARY
                    //
                    // Current Master Data
                    // =========================================

                    const userSummary =
                        await get(
                            `
                                SELECT

                                    COUNT(*) AS totalUsers

                                FROM users
                            `
                        );


                    // =========================================
                    // IMPORT VALUE
                    // =========================================

                    const importAmount =
                        number(
                            importSummary?.importAmount
                        );


                    // =========================================
                    // EXPORT VALUE
                    // =========================================

                    const exportAmount =
                        number(
                            exportSummary?.exportAmount
                        );


                    // =========================================
                    // BALANCE VALUE
                    //
                    // สูตร:
                    //
                    // Import Value
                    // -
                    // Export Value
                    //
                    // =========================================

                    const balanceValue =
                        importAmount -
                        exportAmount;


                    // =========================================
                    // TOTAL WEIGHT
                    //
                    // IMPORTANT
                    //
                    // ใช้:
                    //
                    // stock.total_weight
                    //
                    // ไม่ใช่:
                    //
                    // stock.qty
                    //
                    // เพราะ:
                    //
                    // qty = จำนวนสินค้า
                    //
                    // total_weight = น้ำหนัก
                    //
                    // =========================================

                    const totalWeight =
                        number(
                            stockSummary?.totalStockWeight
                        );


                    // =========================================
                    // RESPONSE
                    // =========================================

                    return res
                        .status(
                            200
                        )
                        .json({

                            success:
                                true,

                            data:
                                {

                                    // =================================
                                    // 1. TOTAL IMPORT
                                    // =================================

                                    totalImport:
                                        number(
                                            importSummary?.totalImport
                                        ),

                                    totalImportQty:
                                        number(
                                            importSummary?.totalImportQty
                                        ),


                                    // =================================
                                    // 2. TOTAL EXPORT
                                    // =================================

                                    totalExport:
                                        number(
                                            exportSummary?.totalExport
                                        ),

                                    totalExportQty:
                                        number(
                                            exportSummary?.totalExportQty
                                        ),


                                    // =================================
                                    // 3. CURRENT STOCK
                                    // =================================

                                    totalStock:
                                        number(
                                            stockSummary?.totalStock
                                        ),

                                    totalStockQty:
                                        number(
                                            stockSummary?.totalStockQty
                                        ),

                                    totalStockValue:
                                        number(
                                            stockSummary?.totalStockValue
                                        ),


                                    // =================================
                                    // 4. TOTAL WEIGHT
                                    // =================================

                                    totalWeight:
                                        totalWeight,


                                    // =================================
                                    // 5. IMPORT VALUE
                                    // =================================

                                    importAmount:
                                        importAmount,


                                    // =================================
                                    // 6. EXPORT VALUE
                                    // =================================

                                    exportAmount:
                                        exportAmount,


                                    // =================================
                                    // 7. BALANCE VALUE
                                    // =================================

                                    balanceValue:
                                        balanceValue,


                                    // =================================
                                    // 8. SUPPLIERS
                                    //
                                    // ส่ง 2 ชื่อเพื่อรองรับ
                                    // Frontend เดิม
                                    // =================================

                                    totalSuppliers:
                                        number(
                                            supplierSummary?.totalSuppliers
                                        ),

                                    supplierCount:
                                        number(
                                            supplierSummary?.totalSuppliers
                                        ),


                                    // =================================
                                    // 9. USERS
                                    //
                                    // ส่ง 2 ชื่อเพื่อรองรับ
                                    // Frontend เดิม
                                    // =================================

                                    totalUsers:
                                        number(
                                            userSummary?.totalUsers
                                        ),

                                    userCount:
                                        number(
                                            userSummary?.totalUsers
                                        )

                                }

                        });

                } catch (
                    err
                ) {

                    console.error(
                        "Dashboard summary error:",
                        err
                    );


                    return res
                        .status(
                            500
                        )
                        .json({

                            success:
                                false,

                            message:
                                err?.message ||
                                "Failed to load dashboard summary"

                        });

                }

            },


// =====================================================
// GET RECENT IMPORT
//
// GET:
//
// /api/dashboard/recent-import
//
// ใช้ Date Filter
// =====================================================

        getRecentImport:
            async (
                req,
                res
            ) => {

                try {

                    const page =
                        normalizePage(
                            req.query.page
                        );


                    const dateFrom =
                        normalizeDate(
                            req.query.dateFrom
                        );


                    const dateTo =
                        normalizeDate(
                            req.query.dateTo
                        );


                    const offset =
                        (
                            page -
                            1
                        ) *
                        PAGE_SIZE;


                    // -----------------------------------------
                    // DATE FILTER
                    // -----------------------------------------

                    const filter =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


                    // -----------------------------------------
                    // QUERY IMPORT
                    //
                    // ใหม่ → เก่า
                    // -----------------------------------------

                    const rows =
                        await all(
                            `
                                SELECT
                                    *

                                FROM imports

                                ${filter.sql}

                                ORDER BY
                                    invoice_date DESC,
                                    id DESC

                                LIMIT ?
                                OFFSET ?
                            `,
                            [

                                ...filter.params,

                                PAGE_SIZE,

                                offset

                            ]
                        );


                    return res
                        .status(
                            200
                        )
                        .json({

                            success:
                                true,

                            data:
                                rows

                        });

                } catch (
                    err
                ) {

                    console.error(
                        "Recent import error:",
                        err
                    );


                    return res
                        .status(
                            500
                        )
                        .json({

                            success:
                                false,

                            message:
                                err?.message ||
                                "Failed to load recent import"

                        });

                }

            },


// =====================================================
// GET RECENT EXPORT
//
// GET:
//
// /api/dashboard/recent-export
//
// ใช้ export_invoice
//
// ใช้ Date Filter
// =====================================================

        getRecentExport:
            async (
                req,
                res
            ) => {

                try {

                    const page =
                        normalizePage(
                            req.query.page
                        );


                    const dateFrom =
                        normalizeDate(
                            req.query.dateFrom
                        );


                    const dateTo =
                        normalizeDate(
                            req.query.dateTo
                        );


                    const offset =
                        (
                            page -
                            1
                        ) *
                        PAGE_SIZE;


                    // -----------------------------------------
                    // DATE FILTER
                    // -----------------------------------------

                    const filter =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


                    // -----------------------------------------
                    // QUERY EXPORT
                    //
                    // ใหม่ → เก่า
                    // -----------------------------------------

                    const rows =
                        await all(
                            `
                                SELECT
                                    *

                                FROM export_invoice

                                ${filter.sql}

                                ORDER BY
                                    invoice_date DESC,
                                    id DESC

                                LIMIT ?
                                OFFSET ?
                            `,
                            [

                                ...filter.params,

                                PAGE_SIZE,

                                offset

                            ]
                        );


                    return res
                        .status(
                            200
                        )
                        .json({

                            success:
                                true,

                            data:
                                rows

                        });

                } catch (
                    err
                ) {

                    console.error(
                        "Recent export error:",
                        err
                    );


                    return res
                        .status(
                            500
                        )
                        .json({

                            success:
                                false,

                            message:
                                err?.message ||
                                "Failed to load recent export"

                        });

                }

            },


// =====================================================
// GET IMPORT PAGES
//
// GET:
//
// /api/dashboard/import-pages
//
// ใช้ Date Filter
// =====================================================

        getImportPages:
            async (
                req,
                res
            ) => {

                try {

                    const dateFrom =
                        normalizeDate(
                            req.query.dateFrom
                        );


                    const dateTo =
                        normalizeDate(
                            req.query.dateTo
                        );


                    const filter =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


                    const result =
                        await get(
                            `
                                SELECT
                                    COUNT(*) AS total

                                FROM imports

                                ${filter.sql}
                            `,
                            filter.params
                        );


                    const total =
                        number(
                            result?.total
                        );


                    const pages =
                        Math.max(

                            1,

                            Math.ceil(
                                total /
                                PAGE_SIZE
                            )

                        );


                    return res
                        .status(
                            200
                        )
                        .json({

                            success:
                                true,

                            data:
                                {

                                    total,

                                    pages,

                                    pageSize:
                                        PAGE_SIZE

                                },

                            // ---------------------------------
                            // รองรับ Frontend เดิม
                            // ---------------------------------

                            pages

                        });

                } catch (
                    err
                ) {

                    console.error(
                        "Import pages error:",
                        err
                    );


                    return res
                        .status(
                            500
                        )
                        .json({

                            success:
                                false,

                            message:
                                err?.message ||
                                "Failed to load import pages"

                        });

                }

            },


// =====================================================
// GET EXPORT PAGES
//
// GET:
//
// /api/dashboard/export-pages
//
// ตาราง:
//
// export_invoice
//
// ใช้ Date Filter
// =====================================================

        getExportPages:
            async (
                req,
                res
            ) => {

                try {

                    const dateFrom =
                        normalizeDate(
                            req.query.dateFrom
                        );


                    const dateTo =
                        normalizeDate(
                            req.query.dateTo
                        );


                    const filter =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


                    const result =
                        await get(
                            `
                                SELECT
                                    COUNT(*) AS total

                                FROM export_invoice

                                ${filter.sql}
                            `,
                            filter.params
                        );


                    const total =
                        number(
                            result?.total
                        );


                    const pages =
                        Math.max(

                            1,

                            Math.ceil(
                                total /
                                PAGE_SIZE
                            )

                        );


                    return res
                        .status(
                            200
                        )
                        .json({

                            success:
                                true,

                            data:
                                {

                                    total,

                                    pages,

                                    pageSize:
                                        PAGE_SIZE

                                },

                            // ---------------------------------
                            // รองรับ Frontend เดิม
                            // ---------------------------------

                            pages

                        });

                } catch (
                    err
                ) {

                    console.error(
                        "Export pages error:",
                        err
                    );


                    return res
                        .status(
                            500
                        )
                        .json({

                            success:
                                false,

                            message:
                                err?.message ||
                                "Failed to load export pages"

                        });

                }

            }

    };


// =====================================================
// EXPORT CONTROLLER
// =====================================================

module.exports =
    DashboardController;