const { run } = require("../../config/database");

module.exports = async () => {

    await run(`
        CREATE TABLE IF NOT EXISTS import_invoice (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            invoice_no TEXT,

            product_name TEXT,

            qty REAL,

            unit TEXT,

            unit_weight REAL,

            weight REAL,

            unit_price REAL,

            total_price REAL,

            supplier TEXT,

            invoice_date TEXT,

            invoice_file TEXT,

            payment_file TEXT,

            formd_file TEXT,

            truck_file TEXT,

            fda_file TEXT,

            import_license_file TEXT,

            acdd_file TEXT,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

        )
    `);

};  