const { db } = require("../../config/database");

function createNotifications() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS notifications (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                title TEXT NOT NULL,

                message TEXT NOT NULL,

                type TEXT DEFAULT 'INFO',

                reference_type TEXT,

                reference_id INTEGER,

                receiver TEXT,

                is_read INTEGER DEFAULT 0,

                priority INTEGER DEFAULT 1,

                created_by TEXT,

                read_at DATETIME,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )

        `, (err) => {

            if (err) {

                console.error("❌ Create notifications table failed");

                return reject(err);

            }

            console.log("✓ notifications");

            resolve();

        });

    });

}

module.exports = createNotifications;