const { db } = require("../../config/database");

function createUnits() {
    return new Promise((resolve, reject) => {

        db.run(`
            CREATE TABLE IF NOT EXISTS units (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                code TEXT UNIQUE NOT NULL,

                name TEXT NOT NULL,

                short_name TEXT,

                description TEXT,

                status INTEGER DEFAULT 1,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {

            if (err) {
                console.error("❌ Create units table failed:", err);
                return reject(err);
            }

            console.log("✓ units");

            resolve();
        });

    });
}

module.exports = createUnits;