const { db } = require("../../config/database");

function createCustomers() {
    return new Promise((resolve, reject) => {

        db.run(`
            CREATE TABLE IF NOT EXISTS customers (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                code TEXT UNIQUE NOT NULL,

                name TEXT NOT NULL,

                contact_name TEXT,

                phone TEXT,

                email TEXT,

                tax_number TEXT,

                address TEXT,

                note TEXT,

                status INTEGER DEFAULT 1,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )
        `, (err) => {

            if (err) {
                console.error("❌ Create customers table failed:", err);
                return reject(err);
            }

            console.log("✓ customers");

            resolve();

        });

    });
}

module.exports = createCustomers;