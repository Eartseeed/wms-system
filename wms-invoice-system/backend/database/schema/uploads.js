const { db } = require("../../config/database");

function createUploads() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS uploads (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                file_name TEXT NOT NULL,

                original_name TEXT,

                file_path TEXT,

                file_extension TEXT,

                mime_type TEXT,

                file_size INTEGER,

                upload_type TEXT,

                reference_type TEXT,

                reference_id INTEGER,

                uploaded_by TEXT,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )

        `, (err) => {

            if (err) {

                console.error("❌ Create uploads table failed");

                return reject(err);

            }

            console.log("✓ uploads");

            resolve();

        });

    });

}

module.exports = createUploads;