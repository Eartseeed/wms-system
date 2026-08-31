const {
    all,
    get
} = require("../config/database");


// =========================================================
// REPORT SERVICE
//
// PROGRAM 2
// - ไม่มี Product Master
// - Product Code / Product Name อยู่ใน Stock / Import / Export
//
// REPORTS
// - Stock
// - Movement
// - Import
// - Export
// - Supplier
// - Summary
// =========================================================

class ReportService {


    // =====================================================
    // STOCK REPORT
    // =====================================================

    async stockReport() {

        return await all(`

            SELECT

                s.id,

                s.product_code,

                s.product_name,

                s.qty AS quantity,

                s.available_qty AS available,

                s.reserved_qty AS reserved,

                s.damage_qty,

                s.hold_qty,

                s.onway_qty,

                s.unit_weight,

                s.total_weight,

                s.unit_cost,

                s.total_cost,

                s.warehouse_id,

                s.location,

                s.rack,

                s.shelf,

                s.bin,

                s.lot_no,

                s.batch_no,

                s.serial_no,

                s.manufacture_date,

                s.expire_date,

                s.receive_date,

                s.status,

                s.last_in,

                s.last_out,

                s.remark,

                s.created_at,

                s.updated_at

            FROM stock s

            WHERE s.status = 1

            ORDER BY
                s.product_code ASC,
                s.id ASC

        `);

    }


    // =====================================================
    // MOVEMENT REPORT
    // =====================================================

    async movementReport(
        startDate = null,
        endDate = null
    ) {

        let sql = `

            SELECT *

            FROM stock_movements

        `;


        const conditions = [];
        const params = [];


        if (startDate) {

            conditions.push(
                `date(created_at) >= date(?)`
            );

            params.push(
                startDate
            );

        }


        if (endDate) {

            conditions.push(
                `date(created_at) <= date(?)`
            );

            params.push(
                endDate
            );

        }


        if (conditions.length > 0) {

            sql += `

                WHERE
                    ${conditions.join(" AND ")}

            `;

        }


        sql += `

            ORDER BY
                datetime(created_at) DESC,
                id DESC

        `;


        return await all(
            sql,
            params
        );

    }


    // =====================================================
    // IMPORT REPORT
    //
    // SOURCE OF TRUTH:
    // imports
    // =====================================================

    async importReport(
        startDate = null,
        endDate = null
    ) {

        let sql = `

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

        `;


        const conditions = [];
        const params = [];


        if (startDate) {

            conditions.push(
                `date(invoice_date) >= date(?)`
            );

            params.push(
                startDate
            );

        }


        if (endDate) {

            conditions.push(
                `date(invoice_date) <= date(?)`
            );

            params.push(
                endDate
            );

        }


        if (conditions.length > 0) {

            sql += `

                WHERE
                    ${conditions.join(" AND ")}

            `;

        }


        sql += `

            ORDER BY
                date(invoice_date) DESC,
                id DESC

        `;


        return await all(
            sql,
            params
        );

    }


    // =====================================================
    // EXPORT REPORT
    //
    // SOURCE OF TRUTH:
    // export_invoice
    //
    // ใช้ข้อมูลชุดเดียวกับ ExportInvoice
    // เพื่อให้ Export Excel ไม่ดึงข้อมูลจาก exports
    // ซึ่งเป็นคนละตารางกับรายละเอียดสินค้า
    // =====================================================

    async exportReport(
        startDate = null,
        endDate = null
    ) {

        let sql = `

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

        `;


        const conditions = [];
        const params = [];


        if (startDate) {

            conditions.push(
                `date(invoice_date) >= date(?)`
            );

            params.push(
                startDate
            );

        }


        if (endDate) {

            conditions.push(
                `date(invoice_date) <= date(?)`
            );

            params.push(
                endDate
            );

        }


        if (conditions.length > 0) {

            sql += `

                WHERE
                    ${conditions.join(" AND ")}

            `;

        }


        sql += `

            ORDER BY
                date(invoice_date) DESC,
                id DESC

        `;


        return await all(
            sql,
            params
        );

    }


    // =====================================================
    // SUPPLIER REPORT
    // =====================================================

    async supplierReport() {

        return await all(`

            SELECT

                id,

                code,

                name,

                contact_name,

                phone,

                email,

                tax_number,

                address,

                note,

                status,

                created_at,

                updated_at

            FROM suppliers

            ORDER BY
                id DESC

        `);

    }


    // =====================================================
    // SUMMARY REPORT
    //
    // Import / Export
    //   ใช้ Date Filter
    //
    // Stock
    //   Current Stock
    //
    // Supplier / User
    //   Current Master Data
    // =====================================================

    async summaryReport(
        startDate = null,
        endDate = null
    ) {

        const importConditions = [];
        const importParams = [];


        const exportConditions = [];
        const exportParams = [];


        // =================================================
        // IMPORT DATE FILTER
        // =================================================

        if (startDate) {

            importConditions.push(
                `date(invoice_date) >= date(?)`
            );

            importParams.push(
                startDate
            );

        }


        if (endDate) {

            importConditions.push(
                `date(invoice_date) <= date(?)`
            );

            importParams.push(
                endDate
            );

        }


        // =================================================
        // EXPORT DATE FILTER
        // =================================================

        if (startDate) {

            exportConditions.push(
                `date(invoice_date) >= date(?)`
            );

            exportParams.push(
                startDate
            );

        }


        if (endDate) {

            exportConditions.push(
                `date(invoice_date) <= date(?)`
            );

            exportParams.push(
                endDate
            );

        }


        const importWhere =
            importConditions.length > 0
                ? `WHERE ${importConditions.join(" AND ")}`
                : "";


        const exportWhere =
            exportConditions.length > 0
                ? `WHERE ${exportConditions.join(" AND ")}`
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

                ${importWhere}

            `, importParams);


        // =================================================
        // EXPORT SUMMARY
        //
        // SOURCE OF TRUTH:
        // export_invoice
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

                ${exportWhere}

            `, exportParams);


        // =================================================
        // CURRENT STOCK
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
        // USERS
        // =================================================

        const userSummary =
            await get(`

                SELECT

                    COUNT(*) AS total

                FROM users

            `);


        // =================================================
        // CALCULATE
        // =================================================

        const importValue =
            Number(
                importSummary?.total_price || 0
            );


        const exportValue =
            Number(
                exportSummary?.total_price || 0
            );


        const balanceValue =
            importValue -
            exportValue;


        // =================================================
        // RESULT
        // =================================================

        return {

            // -------------------------------------------------
            // IMPORT
            // -------------------------------------------------

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


            // -------------------------------------------------
            // EXPORT
            // -------------------------------------------------

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


            // -------------------------------------------------
            // STOCK
            // -------------------------------------------------

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


            // -------------------------------------------------
            // MASTER DATA
            // -------------------------------------------------

            supplierCount:
                Number(
                    supplierSummary?.total || 0
                ),

            userCount:
                Number(
                    userSummary?.total || 0
                ),


            // -------------------------------------------------
            // BALANCE / PROFIT
            //
            // Dashboard รองรับ summary.profit
            // จึงคืนทั้ง 2 ชื่อ
            // -------------------------------------------------

            balanceValue,

            profit:
                balanceValue

        };

    }


    // =====================================================
    // INVENTORY VALUE
    // =====================================================

    async inventoryValue() {

        const result =
            await get(`

                SELECT

                    COALESCE(
                        SUM(total_cost),
                        0
                    ) AS totalValue

                FROM stock

                WHERE status = 1

            `);


        return {

            totalValue:
                Number(
                    result?.totalValue || 0
                )

        };

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports =
    new ReportService();