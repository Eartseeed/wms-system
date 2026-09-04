// =========================================================
// CWMS DATABASE INITIALIZATION
//
// File:
// backend/database/init.js
//
// หน้าที่:
//
// 1. สร้าง Database Schema ทั้งหมด
// 2. ตรวจสอบ Table ที่มีอยู่
// 3. ตรวจสอบ Column ที่ขาด
// 4. เพิ่ม Column ที่ขาดโดยไม่ลบข้อมูลเดิม
// 5. รองรับ Database รุ่นเก่า
// 6. เตรียม Database ให้พร้อมก่อน Server เริ่มทำงาน
//
// =========================================================
//
// ลำดับ:
//
// CORE / SECURITY
//      ↓
// MASTER DATA
//      ↓
// STOCK
//      ↓
// STOCK MOVEMENTS
//      ↓
// IMPORT
//      ↓
// EXPORT
//      ↓
// SYSTEM
//      ↓
// MACHINE / SYNC
//      ↓
// MIGRATION
//
// IMPORTANT:
//
// IMPORT ใช้:
//     imports
//
// EXPORT ใช้:
//     export_invoice
//
// ห้ามสร้าง Table ซ้ำ:
//
// import_invoice
// import_items
// exports
// export_items
//
// เพราะไม่ใช่ Table หลักของ Flow ปัจจุบัน
//
// =========================================================


// =========================================================
// DATABASE CONNECTION
// =========================================================

const {
    db,
    run
} =
    require(
        "../config/database"
    );


// =========================================================
// SCHEMA
// =========================================================

const createRoles =
    require(
        "./schema/roles"
    );


const createPermissions =
    require(
        "./schema/permissions"
    );


const createUsers =
    require(
        "./schema/users"
    );


const createSuppliers =
    require(
        "./schema/suppliers"
    );


const createCustomers =
    require(
        "./schema/customers"
    );


const createStock =
    require(
        "./schema/stock"
    );


const createStockMovements =
    require(
        "./schema/stockMovements"
    );


// =========================================================
// IMPORT
//
// CANONICAL TABLE:
//     imports
//
// ImportService / ImportController / Dashboard / Report
// ใช้ imports เป็น Table หลัก
//
// =========================================================

const createImports =
    require(
        "./schema/imports"
    );


// =========================================================
// EXPORT
//
// CANONICAL TABLE:
//     export_invoice
//
// ExportService / ExportController / Dashboard / Report
// ใช้ export_invoice เป็น Table หลัก
//
// =========================================================

const createExportInvoice =
    require(
        "./schema/exportInvoice"
    );


// =========================================================
// SYSTEM
// =========================================================

const createNotifications =
    require(
        "./schema/notifications"
    );


const createSettings =
    require(
        "./schema/settings"
    );


const createUploads =
    require(
        "./schema/uploads"
    );


// =========================================================
// MACHINE / SYNC
// =========================================================

const createMachines =
    require(
        "./schema/machines"
    );


const createSyncLogs =
    require(
        "./schema/syncLogs"
    );


const createSyncQueue =
    require(
        "./schema/syncQueue"
    );


// =========================================================
// GET TABLE COLUMNS
//
// อ่าน Column ทั้งหมดจาก SQLite
//
// =========================================================

async function getTableColumns(
    tableName
) {

    return await new Promise(
        (
            resolve,
            reject
        ) => {

            db.all(

                `PRAGMA table_info(${tableName})`,

                [],

                (
                    err,
                    rows
                ) => {

                    if (
                        err
                    ) {

                        return reject(
                            err
                        );

                    }


                    return resolve(
                        rows ||
                        []
                    );

                }

            );

        }
    )
        .then(
            (
                rows
            ) =>
                rows.map(
                    (
                        row
                    ) =>
                        row.name
                )
        );

}


// =========================================================
// CHECK TABLE EXISTS
//
// ตรวจสอบว่า Table มีอยู่หรือไม่
//
// =========================================================

async function tableExists(
    tableName
) {

    const row =
        await new Promise(
            (
                resolve,
                reject
            ) => {

                db.get(

                    `
                        SELECT
                            name

                        FROM
                            sqlite_master

                        WHERE
                            type = 'table'

                        AND
                            name = ?

                        LIMIT 1
                    `,

                    [
                        tableName
                    ],

                    (
                        err,
                        result
                    ) => {

                        if (
                            err
                        ) {

                            return reject(
                                err
                            );

                        }


                        return resolve(
                            result ||
                            null
                        );

                    }

                );

            }
        );


    return Boolean(
        row
    );

}


// =========================================================
// ENSURE COLUMN
//
// ตรวจสอบ Column ก่อนเพิ่ม
//
// ถ้ามีอยู่แล้ว:
//     ไม่ทำอะไร
//
// ถ้ายังไม่มี:
//     ALTER TABLE ADD COLUMN
//
// IMPORTANT:
//
// ฟังก์ชันนี้ไม่ลบข้อมูลเดิม
//
// =========================================================

async function ensureColumn(
    tableName,
    columnName,
    columnDefinition
) {

    // -----------------------------------------------------
    // CHECK TABLE
    // -----------------------------------------------------

    const exists =
        await tableExists(
            tableName
        );


    if (
        !exists
    ) {

        console.warn(
            `Table ${tableName} does not exist. Skip ${columnName}`
        );


        return false;

    }


    // -----------------------------------------------------
    // GET COLUMNS
    // -----------------------------------------------------

    const columns =
        await getTableColumns(
            tableName
        );


    // -----------------------------------------------------
    // COLUMN EXISTS
    // -----------------------------------------------------

    if (
        columns.includes(
            columnName
        )
    ) {

        return false;

    }


    // -----------------------------------------------------
    // ADD COLUMN
    // -----------------------------------------------------

    console.log(
        `Add column ${tableName}.${columnName}`
    );


    await run(

        `
            ALTER TABLE
                ${tableName}

            ADD COLUMN
                ${columnName}
                ${columnDefinition}
        `

    );


    console.log(
        `Added column ${tableName}.${columnName}`
    );


    return true;

}


// =========================================================
// MIGRATE DATABASE
//
// ใช้สำหรับ Database รุ่นเก่า
//
// IMPORTANT:
//
// Schema ต้องสร้างเสร็จก่อน
//
// Migration จะ:
//
// - ตรวจสอบ Table
// - ตรวจสอบ Column
// - เพิ่มเฉพาะ Column ที่ไม่มี
// - ไม่ลบข้อมูลเดิม
// - ไม่สร้าง Table ซ้ำ
//
// =========================================================

async function migrateDatabase() {

    console.log(
        ""
    );


    console.log(
        "======================================"
    );


    console.log(
        "Checking Database Schema"
    );


    console.log(
        "======================================"
    );


    // =====================================================
    // STOCK
    // =====================================================

    await ensureColumn(

        "stock",

        "unit",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "unit_cost",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock",

        "total_cost",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock",

        "warehouse_id",

        "INTEGER"

    );


    await ensureColumn(

        "stock",

        "location",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "rack",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "shelf",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "bin",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "lot_no",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "batch_no",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "serial_no",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "manufacture_date",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "expire_date",

        "TEXT"

    );


    await ensureColumn(

        "stock",

        "receive_date",

        "TEXT"

    );

 await ensureColumn(

        "stock",

        "created_by",

        "TEXT"

    );
    await ensureColumn(

        "stock",

        "updated_at",

        "DATETIME"

    );


    // =====================================================
    // STOCK MOVEMENTS
    // =====================================================

    // -----------------------------------------------------
    // IMPORTANT
    //
    // Import / Stock Movement ใช้ unit
    //
    // Database รุ่นเก่าบางตัวไม่มี column นี้
    //
    // ถ้าไม่มี ให้เพิ่มอัตโนมัติ
    // โดยไม่ลบข้อมูลเดิม
    // -----------------------------------------------------

    await ensureColumn(

        "stock_movements",

        "unit",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "movement_no",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "product_code",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "product_name",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "stock_id",

        "INTEGER"

    );


    await ensureColumn(

        "stock_movements",

        "reference_type",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "reference_no",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "movement_type",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "qty",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock_movements",

        "before_qty",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock_movements",

        "after_qty",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock_movements",

        "unit_cost",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock_movements",

        "total_cost",

        "REAL DEFAULT 0"

    );


    await ensureColumn(

        "stock_movements",

        "warehouse_from",

        "INTEGER"

    );


    await ensureColumn(

        "stock_movements",

        "warehouse_to",

        "INTEGER"

    );


    await ensureColumn(

        "stock_movements",

        "location_from",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "location_to",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "lot_no",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "batch_no",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "serial_no",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "remark",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "created_by",

        "TEXT"

    );


    await ensureColumn(

        "stock_movements",

        "created_at",

        "DATETIME"

    );


    // =====================================================
    // IMPORTS
    //
    // CANONICAL TABLE:
    //     imports
    //
    // =====================================================

    await ensureColumn(

        "imports",

        "invoice_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "acdd_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "formd_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "truck_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "payment_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "fda_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "import_license_file",

        "TEXT"

    );


    await ensureColumn(

        "imports",

        "updated_at",

        "DATETIME"

    );


    // =====================================================
    // EXPORT INVOICE
    //
    // CANONICAL TABLE:
    //     export_invoice
    //
    // =====================================================

    await ensureColumn(

        "export_invoice",

        "invoice_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "payment_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "formd_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "phytos_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "tax_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "export_license_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "origin_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "acdd_file",

        "TEXT"

    );


    await ensureColumn(

        "export_invoice",

        "created_at",

        "DATETIME"

    );


    await ensureColumn(

        "export_invoice",

        "updated_at",

        "DATETIME"

    );


    // =====================================================
    // MIGRATION COMPLETE
    // =====================================================

    console.log(
        "======================================"
    );


    console.log(
        "Database Schema Check Complete"
    );


    console.log(
        "======================================"

    );

}


// =========================================================
// INITIALIZE DATABASE
//
// ลำดับ:
//
// 1. CORE / SECURITY
// 2. MASTER DATA
// 3. STOCK
// 4. STOCK MOVEMENTS
// 5. IMPORT
// 6. EXPORT
// 7. SYSTEM
// 8. MACHINE / SYNC
// 9. MIGRATION
//
// =========================================================

async function initializeDatabase() {

    console.log(
        ""
    );


    console.log(
        "======================================"
    );


    console.log(
        "Initialize CWMS Database"
    );


    console.log(
        "======================================"
    );


    try {

        // =================================================
        // 1. CORE / SECURITY
        // =================================================

        console.log(
            "createRoles"
        );

        await createRoles();


        console.log(
            "createPermissions"
        );

        await createPermissions();


        console.log(
            "createUsers"
        );

        await createUsers();


        // =================================================
        // 2. MASTER DATA
        // =================================================

        console.log(
            "createSuppliers"
        );

        await createSuppliers();


        console.log(
            "createCustomers"
        );

        await createCustomers();


        // =================================================
        // 3. STOCK
        // =================================================

        console.log(
            "createStock"
        );

        await createStock();


        // =================================================
        // 4. STOCK MOVEMENTS
        // =================================================

        console.log(
            "createStockMovements"
        );

        await createStockMovements();


        // =================================================
        // 5. IMPORT
        //
        // CANONICAL TABLE:
        //     imports
        //
        // ไม่สร้าง:
        //     import_invoice
        //     import_items
        //
        // =================================================

        console.log(
            "createImports"
        );

        await createImports();


        // =================================================
        // 6. EXPORT
        //
        // CANONICAL TABLE:
        //     export_invoice
        //
        // ไม่สร้าง:
        //     exports
        //     export_items
        //
        // =================================================

        console.log(
            "createExportInvoice"
        );

        await createExportInvoice();


        // =================================================
        // 7. SYSTEM
        // =================================================

        console.log(
            "createNotifications"
        );

        await createNotifications();


        console.log(
            "createSettings"
        );

        await createSettings();


        console.log(
            "createUploads"
        );

        await createUploads();


        // =================================================
        // 8. MACHINE / SYNC
        // =================================================

        console.log(
            "createMachines"
        );

        await createMachines();


        console.log(
            "createSyncLogs"
        );

        await createSyncLogs();


        console.log(
            "createSyncQueue"
        );

        await createSyncQueue();


        // =================================================
        // 9. MIGRATION
        //
        // ต้องทำหลังจาก Table ทั้งหมดถูกสร้างแล้ว
        //
        // =================================================

        await migrateDatabase();


        // =================================================
        // DATABASE READY
        // =================================================

        console.log(
            ""
        );


        console.log(
            "======================================"
        );


        console.log(
            "CWMS Database Ready"
        );


        console.log(
            "======================================"
        );


        return true;

    } catch (
        error
    ) {

        console.error(
            "======================================"
        );


        console.error(
            "CWMS Database initialization failed"
        );


        console.error(
            error
        );


        console.error(
            "======================================"
        );


        throw error;

    }

}


// =========================================================
// EXPORT
//
// server.js:
//
// const {
//     initializeDatabase
// } = require("./database/init");
//
// await initializeDatabase();
//
// =========================================================

module.exports =
    {

        initializeDatabase,

        migrateDatabase,

        ensureColumn,

        tableExists,

        getTableColumns

    };