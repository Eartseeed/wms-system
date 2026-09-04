const { db } = require("../../config/database");

function createStock() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS stock (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                product_code TEXT NOT NULL,

                product_name TEXT NOT NULL,

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

                qty REAL DEFAULT 0,

                unit_weight REAL DEFAULT 0,

                total_weight REAL DEFAULT 0,

                reserved_qty REAL DEFAULT 0,

                available_qty REAL DEFAULT 0,

                damage_qty REAL DEFAULT 0,

                hold_qty REAL DEFAULT 0,

                onway_qty REAL DEFAULT 0,

                unit_cost REAL DEFAULT 0,

                total_cost REAL DEFAULT 0,

                last_in DATETIME,

                last_out DATETIME,

                remark TEXT,

                status INTEGER DEFAULT 1,

                -- เพิ่มเพื่อรองรับ created_by จาก StockService
                -- ไม่กระทบ Column เดิม

                created_by TEXT,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )

        `, (err) => {

            if (err) {

                console.error(
                    "❌ Create stock table failed"
                );

                console.error(err);

                return reject(err);

            }

            console.log("✓ stock");

            resolve();

        });

    });

}

module.exports = createStock;