const { db } = require("../../config/database");

function createSyncQueue() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS sync_queue (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                table_name TEXT,

                record_id INTEGER,

                action TEXT,

                sync_status INTEGER DEFAULT 0,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                synced_at DATETIME

            )

        `, (err) => {

            if (err) {

                return reject(err);

            }

            console.log("✓ sync_queue");

            resolve();

        });

    });

}

module.exports = createSyncQueue;