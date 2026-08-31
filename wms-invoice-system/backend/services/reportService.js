const {
    all,
    get
} = require("../config/database");


// =====================================================
// REPORT SERVICE
// =====================================================

class ReportService {


    // =================================================
    // STOCK REPORT
    // =================================================

    async stockReport() {

        return await all(`

            SELECT

                p.id,

                p.code,

                p.barcode,

                p.name,

                p.cost_price,

                p.sale_price,

                IFNULL(s.quantity, 0) AS quantity,

                IFNULL(s.available, 0) AS available,

                IFNULL(s.reserved, 0) AS reserved,

                p.min_stock,

                p.max_stock

            FROM products p

            LEFT JOIN stock s
                ON p.id = s.product_id

            WHERE p.status = 1

            ORDER BY p.code

        `);

    }


    // =================================================
    // MOVEMENT REPORT
    //
    // GET /api/reports/movement
    // =================================================

    async movementReport(
        startDate = null,
        endDate = null
    ) {

        let sql = `

            SELECT

                sm.*,

                p.code AS product_code,

                p.name AS product_name

            FROM stock_movements sm

            LEFT JOIN products p
                ON p.id = sm.product_id

        `;


        const params = [];

        const conditions = [];


        // -------------------------------------------------
        // DATE FILTER
        // -------------------------------------------------

        if (startDate) {

            conditions.push(`
                date(sm.created_at) >= date(?)
            `);

            params.push(startDate);

        }


        if (endDate) {

            conditions.push(`
                date(sm.created_at) <= date(?)
            `);

            params.push(endDate);

        }


        if (conditions.length > 0) {

            sql += `

                WHERE

                ${conditions.join(" AND ")}

            `;

        }


        sql += `

            ORDER BY sm.created_at DESC

        `;


        return await all(
            sql,
            params
        );

    }


    // =================================================
    // IMPORT REPORT
    //
    // ใช้ invoice_date เป็นวันที่อ้างอิง
    // ตามโครงสร้าง imports ที่ใช้อยู่
    // =================================================

    async importReport(
        startDate = null,
        endDate = null
    ) {

        let sql = `

            SELECT

                i.*,

                p.id AS product_id,

                p.barcode AS product_barcode

            FROM imports i

            LEFT JOIN products p
                ON p.code = i.product_code

        `;


        const params = [];

        const conditions = [];


        // -------------------------------------------------
        // DATE FILTER
        // -------------------------------------------------

        if (startDate) {

            conditions.push(`
                date(i.invoice_date) >= date(?)
            `);

            params.push(startDate);

        }


        if (endDate) {

            conditions.push(`
                date(i.invoice_date) <= date(?)
            `);

            params.push(endDate);

        }


        if (conditions.length > 0) {

            sql += `

                WHERE

                ${conditions.join(" AND ")}

            `;

        }


        sql += `

            ORDER BY i.id DESC

        `;


        return await all(
            sql,
            params
        );

    }


    // =================================================
    // EXPORT REPORT
    //
    // ใช้ export_invoice
    // ไม่ใช่ exports
    // =================================================

    async exportReport(
        startDate = null,
        endDate = null
    ) {

        let sql = `

            SELECT

                e.*

            FROM export_invoice e

        `;


        const params = [];

        const conditions = [];


        // -------------------------------------------------
        // DATE FILTER
        // -------------------------------------------------

        if (startDate) {

            conditions.push(`
                date(e.invoice_date) >= date(?)
            `);

            params.push(startDate);

        }


        if (endDate) {

            conditions.push(`
                date(e.invoice_date) <= date(?)
            `);

            params.push(endDate);

        }


        if (conditions.length > 0) {

            sql += `

                WHERE

                ${conditions.join(" AND ")}

            `;

        }


        sql += `

            ORDER BY e.id DESC

        `;


        return await all(
            sql,
            params
        );

    }


    // =================================================
    // INVENTORY VALUE
    // =================================================

    async inventoryValue() {

        const result =
            await get(`

                SELECT

                    SUM(

                        IFNULL(
                            s.quantity,
                            0
                        )

                        *

                        IFNULL(
                            p.cost_price,
                            0
                        )

                    ) AS totalValue

                FROM products p

                LEFT JOIN stock s
                    ON p.id = s.product_id

                WHERE p.status = 1

            `);


        return {

            totalValue:
                Number(
                    result?.totalValue || 0
                )

        };

    }

}


// =====================================================
// EXPORT
// =====================================================

module.exports =
    new ReportService();