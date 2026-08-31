const { db } = require("../../config/database");

function createSettings() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS settings (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                setting_key TEXT UNIQUE NOT NULL,

                setting_value TEXT,

                description TEXT,

                category TEXT,

                updated_by TEXT,

                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )

        `, (err) => {

            if (err) {

                console.error("❌ Create settings table failed");

                return reject(err);

            }

            console.log("✓ settings");

            resolve();

        });

    });

}

module.exports = createSettings;