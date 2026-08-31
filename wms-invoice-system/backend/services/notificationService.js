const { all } = require("../config/database");

class NotificationService {

    async getAll() {

        const notifications = [];

        /* ===========================================
           Low Stock
        =========================================== */

        const lowStock = await all(

            `
                SELECT

                    id,
                    code,
                    name,
                    stock,
                    min_stock

                FROM products

                WHERE

                    status = 1

                    AND stock <= min_stock

                    AND stock > 0

                ORDER BY stock ASC
            `

        );

        lowStock.forEach(item => {

            notifications.push({

                type: "LOW_STOCK",

                title: "Low Stock",

                message: `${item.name} stock remaining ${item.stock}`,

                productId: item.id,

                createdAt: new Date()

            });

        });

        /* ===========================================
           Out Of Stock
        =========================================== */

        const outOfStock = await all(

            `
                SELECT

                    id,
                    code,
                    name

                FROM products

                WHERE

                    status = 1

                    AND stock <= 0
            `

        );

        outOfStock.forEach(item => {

            notifications.push({

                type: "OUT_OF_STOCK",

                title: "Out Of Stock",

                message: `${item.name} is out of stock`,

                productId: item.id,

                createdAt: new Date()

            });

        });

        return notifications;

    }

    async unreadCount() {

        const list = await this.getAll();

        return {

            total: list.length

        };

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