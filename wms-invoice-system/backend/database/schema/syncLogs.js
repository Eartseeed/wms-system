const { run } = require("../../config/database");

async function createSyncLogs() {

    await run(

        `
        CREATE TABLE IF NOT EXISTS sync_logs (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            device_name TEXT NOT NULL,

            device_ip TEXT,

            sync_type TEXT DEFAULT 'AUTO',

            total_records INTEGER DEFAULT 0,

            status TEXT DEFAULT 'SUCCESS',

            message TEXT,

            sync_time DATETIME DEFAULT CURRENT_TIMESTAMP,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
        `

    );

    console.log("✓ sync_logs");

}

module.exports = createSyncLogs;