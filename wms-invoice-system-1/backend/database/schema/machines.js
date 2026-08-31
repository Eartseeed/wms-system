const { db } = require("../../config/database");

function createMachines() {

    return new Promise((resolve, reject) => {

        db.run(`

            CREATE TABLE IF NOT EXISTS machines (

                id INTEGER PRIMARY KEY AUTOINCREMENT,

                machine_code TEXT UNIQUE,

                machine_name TEXT,

                ip_address TEXT,

                mac_address TEXT,

                device_type TEXT,

                last_sync DATETIME,

                status INTEGER DEFAULT 1,

                created_at DATETIME DEFAULT CURRENT_TIMESTAMP

            )

        `, (err) => {

            if (err) {

                return reject(err);

            }

            console.log("✓ machines");

            resolve();

        });

    });

}

module.exports = createMachines;