const { db } = require("../../config/database");

function createUsers() {
    return new Promise((resolve, reject) => {

        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,

                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,

                fullname TEXT,
                email TEXT,
                phone TEXT,

                role_id INTEGER,

                status INTEGER DEFAULT 1,

                last_login DATETIME,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY(role_id) REFERENCES roles(id)
            )
        `, (err) => {

            if (err) {
                console.error("Create users table failed", err);
                return reject(err);
            }

            console.log("✓ users");

            resolve();
        });

    });
}

module.exports = createUsers;