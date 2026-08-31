const { db } = require("../../config/database");

function createRoles() {
    return new Promise((resolve, reject) => {

        db.run(`
            CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                name TEXT UNIQUE NOT NULL,
                description TEXT,

                status INTEGER DEFAULT 1,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {

            if (err) {
                console.error("Create roles table failed", err);
                return reject(err);
            }

            console.log("✓ roles");

            resolve();
        });

    });
}

module.exports = createRoles;