const { all, get, run } = require("../config/database");

class SyncService {

    async getLastSync() {

        return await get(

            `
                SELECT *

                FROM sync_logs

                ORDER BY sync_time DESC

                LIMIT 1
            `

        );

    }

    async getChanges(lastSync) {

        return {

            products: await all(

                `
                    SELECT *

                    FROM products

                    WHERE updated_at > ?
                `,

                [lastSync]

            ),

            stock: await all(

                `
                    SELECT *

                    FROM stock

                    WHERE updated_at > ?
                `,

                [lastSync]

            ),

            movements: await all(

                `
                    SELECT *

                    FROM stock_movements

                    WHERE created_at > ?
                `,

                [lastSync]

            ),

            imports: await all(

                `
                    SELECT *

                    FROM imports

                    WHERE updated_at > ?
                `,

                [lastSync]

            ),

            exports: await all(

                `
                    SELECT *

                    FROM exports

                    WHERE updated_at > ?
                `,

                [lastSync]

            )

        };

    }

    async saveSyncLog(deviceName) {

        return await run(

            `
                INSERT INTO sync_logs(

                    device_name,

                    sync_time

                )

                VALUES(

                    ?,

                    CURRENT_TIMESTAMP

                )
            `,

            [

                deviceName

            ]

        );

    }

    async getHistory() {

        return await all(

            `
                SELECT *

                FROM sync_logs

                ORDER BY sync_time DESC

                LIMIT 100
            `

        );

    }

}

module.exports = new SyncService();