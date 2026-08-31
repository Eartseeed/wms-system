const { db } = require("../../config/database");

function createPermissions() {
    return new Promise((resolve, reject) => {

        db.run(`
            CREATE TABLE IF NOT EXISTS permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                role_id INTEGER NOT NULL,

                module TEXT NOT NULL,

                can_view INTEGER DEFAULT 0,
                can_create INTEGER DEFAULT 0,
                can_update INTEGER DEFAULT 0,
                can_delete INTEGER DEFAULT 0,
                can_approve INTEGER DEFAULT 0,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY(role_id) REFERENCES roles(id)
            )
        `, (err) => {

            if (err) {
                console.error("Create permissions table failed", err);
                return reject(err);
            }

            console.log("✓ permissions");

            resolve();
        });

    });
}

module.exports = createPermissions;