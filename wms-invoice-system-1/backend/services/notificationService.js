const { all } = require("../config/database");

class NotificationService {
    async getAll() {
        const notifications = [];
        const stock = await all(`
            SELECT id, product_code, product_name, qty, available_qty
            FROM stock
            WHERE status = 1
            ORDER BY available_qty ASC
        `);

        for (const item of stock) {
            const qty = Number(item.available_qty ?? item.qty ?? 0);
            if (qty <= 0) {
                notifications.push({
                    type: "OUT_OF_STOCK",
                    title: "Out Of Stock",
                    message: `${item.product_name || item.product_code} is out of stock`,
                    productCode: item.product_code,
                    createdAt: new Date()
                });
            }
        }
        return notifications;
    }

    async unreadCount() {
        const list = await this.getAll();
        return { total: list.length };
    }

    async systemStatus() {
        return {
            server: "ONLINE",
            database: "CONNECTED",
            sync: "READY",
            time: new Date()
        };
    }
}

module.exports = new NotificationService();
