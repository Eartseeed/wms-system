const { get, all } = require("../config/database");

class DashboardService {

    async summary() {

        const products = await get(
            `
                SELECT COUNT(*) total
                FROM products
                WHERE status = 1
            `
        );

        const suppliers = await get(
            `
                SELECT COUNT(*) total
                FROM suppliers
                WHERE status = 1
            `
        );

        const customers = await get(
            `
                SELECT COUNT(*) total
                FROM customers
                WHERE status = 1
            `
        );

        const imports = await get(
            `
                SELECT COUNT(*) total
                FROM imports
            `
        );

        const exports = await get(
            `
                SELECT COUNT(*) total
                FROM exports
            `
        );

        const stock = await get(
            `
                SELECT
                    SUM(quantity) totalQty,
                    SUM(available) availableQty,
                    SUM(reserved) reservedQty
                FROM stock
            `
        );

        return {

            totalProducts: products.total || 0,

            totalSuppliers: suppliers.total || 0,

            totalCustomers: customers.total || 0,

            totalImports: imports.total || 0,

            totalExports: exports.total || 0,

            stockQuantity: stock.totalQty || 0,

            availableQuantity: stock.availableQty || 0,

            reservedQuantity: stock.reservedQty || 0

        };

    }

    async lowStock() {

        return await all(

            `
                SELECT

                    p.id,

                    p.code,

                    p.name,

                    s.quantity,

                    p.min_stock

                FROM products p

                LEFT JOIN stock s

                    ON p.id = s.product_id

                WHERE

                    p.status = 1

                    AND s.quantity <= p.min_stock

                ORDER BY s.quantity ASC
            `

        );

    }

    async recentMovements(limit = 10) {

        return await all(

            `
                SELECT

                    sm.*,

                    p.code,

                    p.name

                FROM stock_movements sm

                LEFT JOIN products p

                    ON p.id = sm.product_id

                ORDER BY sm.created_at DESC

                LIMIT ?
            `,

            [limit]

        );

    }
// API เก่า สำหรับ Dashboard เดิม

async dashboard() {
    return {
        totalImport: 0,
        totalExport: 0,
        stockQty: 0,
        stockWeight: 0,
        importValue: 0,
        exportValue: 0,
        profit: 0,
        supplierCount: 0,
        userCount: 0,
        importQty: 0,
        exportQty: 0
    };
}

async recentImport() {
    return [];
}

async recentExport() {
    return [];
}

async importPages() {
    return {
        pages: 1
    };
}

async exportPages() {
    return {
        pages: 1
    };
}
}

module.exports = new DashboardService();