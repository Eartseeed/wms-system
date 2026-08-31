const { run } = require("../../config/database");

async function createExportItems() {

    await run(

        `
        CREATE TABLE IF NOT EXISTS export_items (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            export_id INTEGER NOT NULL,

            product_code TEXT NOT NULL,

            product_name TEXT NOT NULL,

            qty REAL NOT NULL DEFAULT 0,

            sale_price REAL NOT NULL DEFAULT 0,

            total_price REAL NOT NULL DEFAULT 0,

            remark TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(export_id)
                REFERENCES exports(id)

        )
        `

    );

    console.log("✓ export_items");

}

module.exports = createExportItems;