const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const DATABASE_DIR = path.join(__dirname, "../database");
const DATABASE_FILE = path.join(
    DATABASE_DIR,
    "cwms.db"
);

// =========================================================
// CREATE DATABASE DIRECTORY
// =========================================================

if (!fs.existsSync(DATABASE_DIR)) {

    fs.mkdirSync(
        DATABASE_DIR,
        {
            recursive: true
        }
    );

}


// =========================================================
// SQLITE CONNECTION
// =========================================================

const db =
    new sqlite3.Database(
        DATABASE_FILE,
        (err) => {

            if (err) {

                console.error(
                    "================================="
                );

                console.error(
                    "Database Connection Error"
                );

                console.error(
                    err.message
                );

                console.error(
                    "================================="
                );

                return;

            }


            console.log(
                "================================="
            );

            console.log(
                "SQLite Connected"
            );

            console.log(
                DATABASE_FILE
            );

            console.log(
                "================================="
            );

        }
    );


// =========================================================
// SQLITE SETTINGS
// =========================================================

db.serialize(() => {

    db.run(
        "PRAGMA foreign_keys = ON;"
    );

    db.run(
        "PRAGMA journal_mode = WAL;"
    );

    db.run(
        "PRAGMA synchronous = NORMAL;"
    );

    db.run(
        "PRAGMA temp_store = MEMORY;"
    );

    db.run(
        "PRAGMA cache_size = -64000;"
    );

});


// =========================================================
// RUN
//
// รองรับ 2 รูปแบบ
//
// 1. Promise
//    const result = await run(sql, params);
//
// 2. SQLite callback
//    db.run(sql, params, callback);
//
// เพื่อไม่ให้ service เดิมที่ใช้ callback
// เช่น auditService.js ได้รับผลกระทบ
// =========================================================

function run(
    sql,
    params = [],
    callback = null
) {

    // -----------------------------------------------------
    // CALLBACK MODE
    // -----------------------------------------------------

    if (typeof callback === "function") {

        return db.run(
            sql,
            params,
            function (err) {

                if (err) {

                    return callback.call(
                        this,
                        err
                    );

                }

                callback.call(
                    this,
                    null
                );

            }
        );

    }


    // -----------------------------------------------------
    // PROMISE MODE
    // -----------------------------------------------------

    return new Promise(
        (resolve, reject) => {

            db.run(
                sql,
                params,
                function (err) {

                    if (err) {

                        return reject(err);

                    }


                    resolve({

                        id:
                            this.lastID,

                        changes:
                            this.changes

                    });

                }
            );

        }
    );

}


// =========================================================
// GET
// =========================================================

function get(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) => {

            db.get(
                sql,
                params,
                (err, row) => {

                    if (err) {

                        return reject(err);

                    }


                    resolve(row);

                }
            );

        }
    );

}


// =========================================================
// ALL
// =========================================================

function all(
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) => {

            db.all(
                sql,
                params,
                (err, rows) => {

                    if (err) {

                        return reject(err);

                    }


                    resolve(rows);

                }
            );

        }
    );

}


// =========================================================
// EXEC
// =========================================================

function exec(
    sql
) {

    return new Promise(
        (resolve, reject) => {

            db.exec(
                sql,
                (err) => {

                    if (err) {

                        return reject(err);

                    }


                    resolve();

                }
            );

        }
    );

}


// =========================================================
// BEGIN TRANSACTION
// =========================================================

async function beginTransaction() {

    await exec(
        "BEGIN TRANSACTION"
    );

}


// =========================================================
// COMMIT TRANSACTION
// =========================================================

async function commitTransaction() {

    await exec(
        "COMMIT"
    );

}


// =========================================================
// ROLLBACK TRANSACTION
// =========================================================

async function rollbackTransaction() {

    try {

        await exec(
            "ROLLBACK"
        );

    } catch (err) {

        console.error(
            "Rollback error:",
            err
        );

    }

}


// =========================================================
// TRANSACTION HELPER
//
// callback สามารถใช้ run/get/all ได้ตามปกติ
//
// =========================================================

async function transaction(
    callback
) {

    await beginTransaction();

    try {

        const result =
            await callback();

        await commitTransaction();

        return result;

    } catch (err) {

        await rollbackTransaction();

        throw err;

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    db,

    run,

    get,

    all,

    exec,

    beginTransaction,

    commitTransaction,

    rollbackTransaction,

    transaction

};