const { db } = require("../../config/database");

function createExports() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS exports (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                export_no TEXT UNIQUE NOT NULL,

                customer_id INTEGER,

                invoice_no TEXT,

                so_no TEXT,

                export_date DATE,

                warehouse_id INTEGER,

                total_item INTEGER DEFAULT 0,

                total_qty REAL DEFAULT 0,

                total_price REAL DEFAULT 0,

                discount REAL DEFAULT 0,

                vat REAL DEFAULT 0,

                grand_total REAL DEFAULT 0,

                status TEXT DEFAULT 'PENDING',

                approved_by TEXT,

                approved_at DATETIME,

                completed_by TEXT,

                completed_at DATETIME,

                remark TEXT,

                created_by TEXT,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY(customer_id) REFERENCES customers(id)

            )

        `, (err) => {

            if (err) {

                console.error("❌ Create exports table failed");

                console.error(err);

                return reject(err);

            }

            console.log("✓ exports");

            resolve();

        });

    });

}

module.exports = createExports; 