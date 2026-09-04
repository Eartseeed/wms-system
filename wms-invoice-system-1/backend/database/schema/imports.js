const { db } = require("../../config/database");

function createImports() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS imports (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                invoice_no TEXT,

                product_code TEXT,

                product_name TEXT,

                product_type TEXT,

                qty REAL DEFAULT 0,

                unit TEXT,

                unit_weight REAL DEFAULT 0,

                weight REAL DEFAULT 0,

                unit_price REAL DEFAULT 0,

                total_price REAL DEFAULT 0,

                supplier TEXT,

                warehouse_id INTEGER,

                location TEXT,

                rack TEXT,

                shelf TEXT,

                bin TEXT,

                lot_no TEXT,

                batch_no TEXT,

                serial_no TEXT,

                manufacture_date DATE,

                expire_date DATE,

                receive_date DATE,

                invoice_date DATE,

                invoice_file TEXT,

                acdd_file TEXT,

                formd_file TEXT,

                truck_file TEXT,

                payment_file TEXT,

                fda_file TEXT,

                import_license_file TEXT,

                created_by TEXT,

                updated_by TEXT,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )

        `, (err) => {

            if (err) {

                console.error(
                    "❌ Create imports table failed"
                );

                console.error(err);

                return reject(err);

            }

            console.log(
                "✓ imports"
            );

            resolve();

        });

    });

}

module.exports = createImports;