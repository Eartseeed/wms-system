const { db } = require("../../config/database");

function createCategories() {
    return new Promise((resolve, reject) => {

        db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                code TEXT UNIQUE NOT NULL,

                name TEXT NOT NULL,

                description TEXT,

                status INTEGER DEFAULT 1,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {

            if (err) {
                console.error("❌ Create categories table failed:", err);
                return reject(err);
            }

            console.log("✓ categories");

            resolve();
        });

    });
}

module.exports = createCategories;