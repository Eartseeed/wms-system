const { run } = require("../../config/database");

async function createImportItems() {

    await run(

        `
        CREATE TABLE IF NOT EXISTS import_items (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            import_id INTEGER NOT NULL,

            product_code TEXT NOT NULL,

            product_name TEXT NOT NULL,

            qty REAL NOT NULL DEFAULT 0,

            cost_price REAL NOT NULL DEFAULT 0,

            total_cost REAL NOT NULL DEFAULT 0,

            remark TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY(import_id)
                REFERENCES imports(id)

        )
        `

    );

    console.log("✓ import_items");

}

module.exports = createImportItems;