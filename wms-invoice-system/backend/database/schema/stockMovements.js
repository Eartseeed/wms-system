const { db } = require("../../config/database");

function createStockMovements() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS stock_movements (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                movement_no TEXT UNIQUE,

                product_code TEXT NOT NULL,

                product_name TEXT NOT NULL,

                stock_id INTEGER,

                reference_type TEXT,

                reference_no TEXT,

                movement_type TEXT NOT NULL,

                warehouse_from INTEGER,

                warehouse_to INTEGER,

                location_from TEXT,

                location_to TEXT,

                qty REAL DEFAULT 0,

                before_qty REAL DEFAULT 0,

                after_qty REAL DEFAULT 0,

                unit_cost REAL DEFAULT 0,

                total_cost REAL DEFAULT 0,

                lot_no TEXT,

                batch_no TEXT,

                serial_no TEXT,

                remark TEXT,

                created_by TEXT,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY(stock_id)
                    REFERENCES stock(id)

            )

        `, (err) => {

            if (err) {

                console.error(
                    "❌ Create stock_movements table failed"
                );

                console.error(err);

                return reject(err);

            }

            console.log("✓ stock_movements");

            resolve();

        });

    });

}

module.exports = createStockMovements;