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
// DATE FILTER
//
// Total Import  → ใช้ dateFrom / dateTo
// Total Export  → ใช้ dateFrom / dateTo
//
// Current Stock → ไม่ใช้ Date Filter
// Total Weight  → ไม่ใช้ Date Filter
// Import Value  → ไม่ใช้ Date Filter
// Export Value  → ไม่ใช้ Date Filter
// Balance Value → ไม่ใช้ Date Filter
// Suppliers     → ไม่ใช้ Date Filter
// Users         → ไม่ใช้ Date Filter
//
// =====================================================


const PAGE_SIZE =
    10;


// =====================================================
// NORMALIZE DATE
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
// ใช้กับ:
// - Total Import
// - Total Export
// - Recent Import
// - Recent Export
// - Import Pages
// - Export Pages
//
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


        // =================================================
        // GET SUMMARY
        //
        // /api/dashboard
        // /api/dashboard/summary
        //
        // IMPORTANT:
        //
        // Total Import / Total Export
        // จะเปลี่ยนตามวันที่เลือก
        //
        // ส่วน Current Stock และค่าอื่น
        // ยังคงเป็น Current / Total
        // =================================================

        getSummary:
            async (
                req,
                res
            ) => {

                try {


                    // =========================================
                    // DATE FILTER
                    //
                    // รับจาก Frontend:
                    //
                    // ?dateFrom=2026-08-01
                    // &dateTo=2026-08-31
                    //
                    // =========================================

                    const dateFrom =
                        normalizeDate(
                            req.query.dateFrom
                        );


                    const dateTo =
                        normalizeDate(
                            req.query.dateTo
                        );


                    // =========================================
                    // IMPORT DATE FILTER
                    //
                    // Total Import ต้องแสดง
                    // ตามวันที่เลือก
                    //
                    // =========================================

                    const importWhere =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


                    // =========================================
                    // IMPORT SUMMARY
                    //
                    // ตาราง:
                    // imports
                    //
                    // Total Import:
                    // COUNT(*)
                    //
                    // Import Qty:
                    // SUM(qty)
                    //
                    // Import Value:
                    // SUM(total_price)
                    //
                    // IMPORTANT:
                    //
                    // Total Import ใช้ Date Filter
                    // ตามที่ผู้ใช้เลือก
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

                                ${importWhere.sql}
                            `,
                            importWhere.params
                        );


                    // =========================================
                    // EXPORT DATE FILTER
                    //
                    // Total Export ต้องแสดง
                    // ตามวันที่เลือก
                    // =========================================

                    const exportWhere =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


                    // =========================================
                    // EXPORT SUMMARY
                    //
                    // ตาราง:
                    // export_invoice
                    //
                    // IMPORTANT:
                    //
                    // ห้ามเปลี่ยนเป็น exports
                    //
                    // Project ปัจจุบันใช้:
                    // export_invoice
                    //
                    // Total Export ใช้ Date Filter
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

                                ${exportWhere.sql}
                            `,
                            exportWhere.params
                        );


                    // =========================================
                    // STOCK SUMMARY
                    //
                    // Current Stock
                    //
                    // ไม่ใช้ Date Filter
                    //
                    // เพราะ Stock คือสถานะปัจจุบัน
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
                    //
                    // IMPORTANT:
                    //
                    // ยังคงใช้ Import Value
                    // จากข้อมูล Import ทั้งหมด
                    //
                    // ไม่ใช้ Date Filter
                    //
                    // ดังนั้น:
                    //
                    // Total Import     = ตามวันที่
                    // Import Value     = ทั้งหมด
                    //
                    // =========================================

                    const importValueSummary =
                        await get(
                            `
                                SELECT

                                    COALESCE(
                                        SUM(total_price),
                                        0
                                    ) AS importAmount

                                FROM imports
                            `
                        );


                    // =========================================
                    // EXPORT VALUE
                    //
                    // IMPORTANT:
                    //
                    // ยังคงใช้ Export Value
                    // จากข้อมูล Export ทั้งหมด
                    //
                    // ไม่ใช้ Date Filter
                    //
                    // ดังนั้น:
                    //
                    // Total Export     = ตามวันที่
                    // Export Value     = ทั้งหมด
                    //
                    // =========================================

                    const exportValueSummary =
                        await get(
                            `
                                SELECT

                                    COALESCE(
                                        SUM(total_price),
                                        0
                                    ) AS exportAmount

                                FROM export_invoice
                            `
                        );


                    // =========================================
                    // SAFE IMPORT VALUE
                    // =========================================

                    const importAmount =
                        number(
                            importValueSummary?.importAmount
                        );


                    // =========================================
                    // SAFE EXPORT VALUE
                    // =========================================

                    const exportAmount =
                        number(
                            exportValueSummary?.exportAmount
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
                    // ใช้ยอดทั้งหมด
                    // ไม่ใช้ Date Filter
                    // =========================================

                    const balanceValue =
                        importAmount -
                        exportAmount;


                    // =========================================
                    // TOTAL WEIGHT
                    //
                    // ใช้:
                    //
                    // stock.total_weight
                    //
                    // ไม่ใช่ qty
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
                                    //
                                    // ตามวันที่เลือก
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
                                    //
                                    // ตามวันที่เลือก
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
                                    //
                                    // Current
                                    // ไม่กรองวันที่
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
                                    //
                                    // Current Stock Weight
                                    // =================================

                                    totalWeight:
                                        totalWeight,


                                    // =================================
                                    // 5. IMPORT VALUE
                                    //
                                    // มูลค่า Import ทั้งหมด
                                    // =================================

                                    importAmount:
                                        importAmount,


                                    // =================================
                                    // 6. EXPORT VALUE
                                    //
                                    // มูลค่า Export ทั้งหมด
                                    // =================================

                                    exportAmount:
                                        exportAmount,


                                    // =================================
                                    // 7. BALANCE VALUE
                                    //
                                    // Import Value
                                    // -
                                    // Export Value
                                    // =================================

                                    balanceValue:
                                        balanceValue,


                                    // =================================
                                    // 8. SUPPLIERS
                                    //
                                    // รองรับ Frontend เดิม
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
                                    // รองรับ Frontend เดิม
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


        // =================================================
        // GET RECENT IMPORT
        // =================================================

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


                    const filter =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


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


        // =================================================
        // GET RECENT EXPORT
        // =================================================

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


                    const filter =
                        buildDateWhere(
                            "invoice_date",
                            dateFrom,
                            dateTo
                        );


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


        // =================================================
        // GET IMPORT PAGES
        // =================================================

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


        // =================================================
        // GET EXPORT PAGES
        // =================================================

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