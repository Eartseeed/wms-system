const {
    get,
    all
} = require("../config/database");


// =========================================================
// DASHBOARD SERVICE
//
// PROGRAM 2
// - ไม่มี Product Master
// - ไม่มี Customer dependency
// - Product Number / Product Name อยู่ใน Stock โดยตรง
//
// DASHBOARD FLOW
//
// IMPORT
//   -> imports
//
// EXPORT
//   -> export_invoice
//
// STOCK
//   -> stock
//
// MOVEMENT
//   -> stock_movements
// =========================================================

class DashboardService {


    // =====================================================
    // SUMMARY
    // =====================================================

    async summary() {

        const suppliers =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM suppliers
                WHERE status = 1
            `);


        const imports =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM imports
            `);


        const exports =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM export_invoice
            `);


        const stock =
            await get(`
                SELECT

                    COUNT(*) AS product_count,

                    COALESCE(
                        SUM(qty),
                        0
                    ) AS total_qty,

                    COALESCE(
                        SUM(available_qty),
                        0
                    ) AS available_qty,

                    COALESCE(
                        SUM(reserved_qty),
                        0
                    ) AS reserved_qty,

                    COALESCE(
                        SUM(damage_qty),
                        0
                    ) AS damage_qty,

                    COALESCE(
                        SUM(hold_qty),
                        0
                    ) AS hold_qty,

                    COALESCE(
                        SUM(onway_qty),
                        0
                    ) AS onway_qty,

                    COALESCE(
                        SUM(total_weight),
                        0
                    ) AS total_weight,

                    COALESCE(
                        SUM(total_cost),
                        0
                    ) AS total_cost

                FROM stock

                WHERE status = 1
            `);


        return {

            // ---------------------------------------------
            // IMPORT
            // ---------------------------------------------

            totalImports:
                Number(
                    imports?.total || 0
                ),


            // ---------------------------------------------
            // EXPORT
            // ---------------------------------------------

            totalExports:
                Number(
                    exports?.total || 0
                ),


            // ---------------------------------------------
            // SUPPLIER
            // ---------------------------------------------

            totalSuppliers:
                Number(
                    suppliers?.total || 0
                ),


            // ---------------------------------------------
            // STOCK
            // ---------------------------------------------

            totalStockProducts:
                Number(
                    stock?.product_count || 0
                ),

            stockQuantity:
                Number(
                    stock?.total_qty || 0
                ),

            availableQuantity:
                Number(
                    stock?.available_qty || 0
                ),

            reservedQuantity:
                Number(
                    stock?.reserved_qty || 0
                ),

            damageQuantity:
                Number(
                    stock?.damage_qty || 0
                ),

            holdQuantity:
                Number(
                    stock?.hold_qty || 0
                ),

            onwayQuantity:
                Number(
                    stock?.onway_qty || 0
                ),

            stockWeight:
                Number(
                    stock?.total_weight || 0
                ),

            stockValue:
                Number(
                    stock?.total_cost || 0
                )

        };

    }


    // =====================================================
    // LOW STOCK
    //
    // ไม่มี Product Master
    // ใช้ stock โดยตรง
    //
    // หมายเหตุ:
    // ใช้ available_qty <= 0 เป็นรายการที่ต้องตรวจสอบ
    // และรองรับ min_stock ถ้ามี column อยู่ใน stock
    // =====================================================

    async lowStock() {

        return await all(`
            SELECT
                id,
                product_code,
                product_name,
                qty,
                available_qty,
                reserved_qty,
                damage_qty,
                hold_qty,
                onway_qty,
                unit_weight,
                total_weight,
                unit_cost,
                total_cost,
                warehouse_id,
                location,
                rack,
                shelf,
                bin,
                lot_no,
                batch_no,
                serial_no,
                last_in,
                last_out,
                updated_at

            FROM stock

            WHERE status = 1

              AND COALESCE(
                    available_qty,
                    0
                  ) <= 0

            ORDER BY
                available_qty ASC,
                id DESC
        `);

    }


    // =====================================================
    // RECENT MOVEMENTS
    //
    // ไม่ JOIN products
    //
    // เพราะ Program 2 ไม่มี Product Master
    // =====================================================

    async recentMovements(
        limit = 10
    ) {

        let safeLimit =
            Number(limit);

        if (
            !Number.isFinite(safeLimit) ||
            safeLimit <= 0
        ) {
            safeLimit = 10;
        }

        safeLimit =
            Math.min(
                Math.floor(safeLimit),
                100
            );


        return await all(`
            SELECT
                *
            FROM stock_movements

            ORDER BY
                created_at DESC,
                id DESC

            LIMIT ?
        `, [
            safeLimit
        ]);

    }


    // =====================================================
    // DASHBOARD
    //
    // GET /api/dashboard
    // =====================================================

    async dashboard(
        dateFrom = "",
        dateTo = ""
    ) {

        const importWhere = [];
        const exportWhere = [];

        const importParams = [];
        const exportParams = [];


        // =================================================
        // IMPORT DATE FILTER
        // =================================================

        if (dateFrom) {

            importWhere.push(
                "date(invoice_date) >= date(?)"
            );

            importParams.push(
                dateFrom
            );

        }


        if (dateTo) {

            importWhere.push(
                "date(invoice_date) <= date(?)"
            );

            importParams.push(
                dateTo
            );

        }


        // =================================================
        // EXPORT DATE FILTER
        // =================================================

        if (dateFrom) {

            exportWhere.push(
                "date(invoice_date) >= date(?)"
            );

            exportParams.push(
                dateFrom
            );

        }


        if (dateTo) {

            exportWhere.push(
                "date(invoice_date) <= date(?)"
            );

            exportParams.push(
                dateTo
            );

        }


        const importCondition =
            importWhere.length
                ? `WHERE ${importWhere.join(" AND ")}`
                : "";


        const exportCondition =
            exportWhere.length
                ? `WHERE ${exportWhere.join(" AND ")}`
                : "";


        // =================================================
        // IMPORT SUMMARY
        // =================================================

        const importSummary =
            await get(`
                SELECT

                    COUNT(*) AS invoice_count,

                    COALESCE(
                        SUM(qty),
                        0
                    ) AS qty,

                    COALESCE(
                        SUM(weight),
                        0
                    ) AS weight,

                    COALESCE(
                        SUM(total_price),
                        0
                    ) AS total_price

                FROM imports

                ${importCondition}
            `, [
                ...importParams
            ]);


        // =================================================
        // EXPORT SUMMARY
        // =================================================

        const exportSummary =
            await get(`
                SELECT

                    COUNT(*) AS invoice_count,

                    COALESCE(
                        SUM(qty),
                        0
                    ) AS qty,

                    COALESCE(
                        SUM(weight),
                        0
                    ) AS weight,

                    COALESCE(
                        SUM(total_price),
                        0
                    ) AS total_price

                FROM export_invoice

                ${exportCondition}
            `, [
                ...exportParams
            ]);


        // =================================================
        // STOCK SUMMARY
        //
        // Stock ไม่ใช้ date filter
        // เพราะเป็นยอดคงเหลือปัจจุบัน
        // =================================================

        const stockSummary =
            await get(`
                SELECT

                    COUNT(*) AS product_count,

                    COALESCE(
                        SUM(qty),
                        0
                    ) AS qty,

                    COALESCE(
                        SUM(available_qty),
                        0
                    ) AS available_qty,

                    COALESCE(
                        SUM(reserved_qty),
                        0
                    ) AS reserved_qty,

                    COALESCE(
                        SUM(damage_qty),
                        0
                    ) AS damage_qty,

                    COALESCE(
                        SUM(hold_qty),
                        0
                    ) AS hold_qty,

                    COALESCE(
                        SUM(onway_qty),
                        0
                    ) AS onway_qty,

                    COALESCE(
                        SUM(total_weight),
                        0
                    ) AS weight,

                    COALESCE(
                        SUM(total_cost),
                        0
                    ) AS value

                FROM stock

                WHERE status = 1
            `);


        // =================================================
        // SUPPLIER
        // =================================================

        const supplierSummary =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM suppliers
                WHERE status = 1
            `);


        // =================================================
        // USER
        // =================================================

        const userSummary =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM users
            `);


        // =================================================
        // VALUES
        // =================================================

        const importValue =
            Number(
                importSummary?.total_price || 0
            );


        const exportValue =
            Number(
                exportSummary?.total_price || 0
            );


        // =================================================
        // RETURN
        // =================================================

        return {

            // ---------------------------------------------
            // IMPORT
            // ---------------------------------------------

            totalImport:
                Number(
                    importSummary?.invoice_count || 0
                ),

            importQty:
                Number(
                    importSummary?.qty || 0
                ),

            importWeight:
                Number(
                    importSummary?.weight || 0
                ),

            importValue,


            // ---------------------------------------------
            // EXPORT
            // ---------------------------------------------

            totalExport:
                Number(
                    exportSummary?.invoice_count || 0
                ),

            exportQty:
                Number(
                    exportSummary?.qty || 0
                ),

            exportWeight:
                Number(
                    exportSummary?.weight || 0
                ),

            exportValue,


            // ---------------------------------------------
            // STOCK
            // ---------------------------------------------

            stockProducts:
                Number(
                    stockSummary?.product_count || 0
                ),

            stockQty:
                Number(
                    stockSummary?.qty || 0
                ),

            availableQty:
                Number(
                    stockSummary?.available_qty || 0
                ),

            reservedQty:
                Number(
                    stockSummary?.reserved_qty || 0
                ),

            damageQty:
                Number(
                    stockSummary?.damage_qty || 0
                ),

            holdQty:
                Number(
                    stockSummary?.hold_qty || 0
                ),

            onwayQty:
                Number(
                    stockSummary?.onway_qty || 0
                ),

            stockWeight:
                Number(
                    stockSummary?.weight || 0
                ),

            stockValue:
                Number(
                    stockSummary?.value || 0
                ),


            // ---------------------------------------------
            // MASTER DATA
            // ---------------------------------------------

            supplierCount:
                Number(
                    supplierSummary?.total || 0
                ),

            userCount:
                Number(
                    userSummary?.total || 0
                )

        };

    }


    // =====================================================
    // RECENT IMPORT
    // =====================================================

    async recentImport(
        page = 1,
        dateFrom = "",
        dateTo = ""
    ) {

        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            );

        const limit = 10;

        const offset =
            (pageNumber - 1) *
            limit;

        const where = [];
        const params = [];


        if (dateFrom) {

            where.push(
                "date(invoice_date) >= date(?)"
            );

            params.push(
                dateFrom
            );

        }


        if (dateTo) {

            where.push(
                "date(invoice_date) <= date(?)"
            );

            params.push(
                dateTo
            );

        }


        const condition =
            where.length
                ? `WHERE ${where.join(" AND ")}`
                : "";


        return await all(`
            SELECT

                id,

                invoice_no,

                product_code,

                product_name,

                qty,

                unit,

                unit_weight,

                weight,

                unit_price,

                total_price,

                supplier,

                invoice_date,

                invoice_file,

                acdd_file,

                formd_file,

                truck_file,

                payment_file,

                fda_file,

                import_license_file,

                created_at,

                updated_at

            FROM imports

            ${condition}

            ORDER BY
                id DESC

            LIMIT ?

            OFFSET ?
        `, [
            ...params,
            limit,
            offset
        ]);

    }


    // =====================================================
    // RECENT EXPORT
    // =====================================================

    async recentExport(
        page = 1,
        dateFrom = "",
        dateTo = ""
    ) {

        const pageNumber =
            Math.max(
                Number(page) || 1,
                1
            );

        const limit = 10;

        const offset =
            (pageNumber - 1) *
            limit;

        const where = [];
        const params = [];


        if (dateFrom) {

            where.push(
                "date(invoice_date) >= date(?)"
            );

            params.push(
                dateFrom
            );

        }


        if (dateTo) {

            where.push(
                "date(invoice_date) <= date(?)"
            );

            params.push(
                dateTo
            );

        }


        const condition =
            where.length
                ? `WHERE ${where.join(" AND ")}`
                : "";


        return await all(`
            SELECT

                id,

                invoice_no,

                product_code,

                product_name,

                qty,

                unit,

                unit_weight,

                weight,

                unit_price,

                total_price,

                supplier,

                invoice_date,

                invoice_file,

                payment_file,

                formd_file,

                phytos_file,

                tax_file,

                export_license_file,

                origin_file,

                acdd_file,

                created_at,

                updated_at

            FROM export_invoice

            ${condition}

            ORDER BY
                id DESC

            LIMIT ?

            OFFSET ?
        `, [
            ...params,
            limit,
            offset
        ]);

    }


    // =====================================================
    // IMPORT PAGES
    // =====================================================

    async importPages(
        dateFrom = "",
        dateTo = ""
    ) {

        const where = [];
        const params = [];


        if (dateFrom) {

            where.push(
                "date(invoice_date) >= date(?)"
            );

            params.push(
                dateFrom
            );

        }


        if (dateTo) {

            where.push(
                "date(invoice_date) <= date(?)"
            );

            params.push(
                dateTo
            );

        }


        const condition =
            where.length
                ? `WHERE ${where.join(" AND ")}`
                : "";


        const result =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM imports
                ${condition}
            `, [
                ...params
            ]);


        return {

            pages:
                Math.max(
                    Math.ceil(
                        Number(
                            result?.total || 0
                        ) / 10
                    ),
                    1
                )

        };

    }


    // =====================================================
    // EXPORT PAGES
    // =====================================================

    async exportPages(
        dateFrom = "",
        dateTo = ""
    ) {

        const where = [];
        const params = [];


        if (dateFrom) {

            where.push(
                "date(invoice_date) >= date(?)"
            );

            params.push(
                dateFrom
            );

        }


        if (dateTo) {

            where.push(
                "date(invoice_date) <= date(?)"
            );

            params.push(
                dateTo
            );

        }


        const condition =
            where.length
                ? `WHERE ${where.join(" AND ")}`
                : "";


        const result =
            await get(`
                SELECT
                    COUNT(*) AS total
                FROM export_invoice
                ${condition}
            `, [
                ...params
            ]);


        return {

            pages:
                Math.max(
                    Math.ceil(
                        Number(
                            result?.total || 0
                        ) / 10
                    ),
                    1
                )

        };

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports =
    new DashboardService();