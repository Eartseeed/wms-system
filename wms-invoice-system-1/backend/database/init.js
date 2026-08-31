const {
    db,
    run
} =
    require(
        "../config/database"
    );


// =========================================================
// DATABASE INITIALIZATION
//
// Path:
//
// backend/database/init.js
//
// =========================================================
//
// หน้าที่:
//
// 1. สร้างตารางใหม่
//
// 2. ตรวจสอบตารางเดิม
//
// 3. เพิ่ม Column ที่ขาด
//
// 4. รักษาข้อมูลเดิม
//
// 5. เตรียม Database ก่อน Server ทำงาน
//
// =========================================================
//
// IMPORTANT
//
// ลำดับการสร้าง Table มีความสำคัญ
//
// CORE
//      ↓
// MASTER DATA
//      ↓
// STOCK
//      ↓
// MOVEMENT
//      ↓
// IMPORT / EXPORT
//      ↓
// SYSTEM
//      ↓
// SYNC
//      ↓
// MIGRATION
//
// =========================================================


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


const createImports =
    require(
        "./schema/imports"
    );


const createImportItems =
    require(
        "./schema/importItems"
    );


const createImportInvoice =
    require(
        "./schema/importInvoice"
    );


const createExports =
    require(
        "./schema/exports"
    );


const createExportItems =
    require(
        "./schema/exportItems"
    );


const createExportInvoice =
    require(
        "./schema/exportInvoice"
    );


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
// ตัวอย่าง:
//
// PRAGMA table_info(stock)
//
// Return:
//
// [
//     "id",
//     "product_code",
//     "qty"
// ]
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
// ตรวจสอบ Table ก่อนทำ Migration
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
// ตรวจสอบว่า Column มีอยู่แล้วหรือไม่
//
// ถ้ายังไม่มี:
//
// ALTER TABLE
// ADD COLUMN
//
// =========================================================
//
// IMPORTANT
//
// ฟังก์ชันนี้:
//
// - ไม่ลบข้อมูลเก่า
// - ไม่สร้าง Column ซ้ำ
// - ปลอดภัยสำหรับ Migration
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


    return true;

}


// =========================================================
// MIGRATE DATABASE
//
// Migration สำหรับ:
//
// Database เดิม
//
// ใช้หลัง Schema ทั้งหมดถูกสร้างแล้ว
//
// =========================================================
//
// IMPORTANT
//
// ถ้า Schema ล่าสุดมี Migration ของตัวเอง:
//
// เช่น:
//
// stockMovements.js
//
// ก็ยังสามารถเรียก ensureColumn ซ้ำได้
//
// เพราะ ensureColumn จะตรวจสอบก่อน
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

        "updated_at",

        "DATETIME"

    );


    // =====================================================
    // STOCK MOVEMENTS
    //
    // รองรับฐานข้อมูลเก่า
    //
    // Schema ล่าสุดจะมี:
    //
    // movement_no
    // product_code
    // product_name
    // stock_id
    // reference_type
    // reference_no
    // movement_type
    // qty
    // before_qty
    // after_qty
    // unit_cost
    // total_cost
    // warehouse_from
    // warehouse_to
    // location_from
    // location_to
    // lot_no
    // batch_no
    // serial_no
    // remark
    // created_by
    // created_at
    //
    // =====================================================

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
    // เอกสาร Import หลัก
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
    // EXPORTS
    //
    // เอกสาร Export หลัก
    //
    // =====================================================

    await ensureColumn(

        "exports",

        "origin_file",

        "TEXT"

    );


    await ensureColumn(

        "exports",

        "acdd_file",

        "TEXT"

    );


    await ensureColumn(

        "exports",

        "updated_at",

        "DATETIME"

    );


    // =====================================================
    // IMPORT INVOICE
    //
    // ตารางนี้ยังคงอยู่
    // เพื่อรองรับโครงสร้างเดิมของระบบ
    //
    // =====================================================

    await ensureColumn(

        "import_invoice",

        "invoice_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "acdd_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "formd_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "truck_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "payment_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "fda_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "import_license_file",

        "TEXT"

    );


    await ensureColumn(

        "import_invoice",

        "created_at",

        "DATETIME"

    );


    await ensureColumn(

        "import_invoice",

        "updated_at",

        "DATETIME"

    );


    // =====================================================
    // EXPORT INVOICE
    //
    // รองรับข้อมูลเดิม
    //
    // =====================================================

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


    console.log(
        "Database Schema Check Complete"
    );

}


// =========================================================
// INITIALIZE DATABASE
//
// จุดเริ่มต้นของ Database
//
// =========================================================
//
// ลำดับ:
//
// 1. Core
//
// 2. Master Data
//
// 3. Stock
//
// 4. Import
//
// 5. Export
//
// 6. System
//
// 7. Sync
//
// 8. Migration
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
        //
        // Stock ต้องสร้างก่อน Movement
        //
        // =================================================

        console.log(
            "createStock"
        );

        await createStock();


        console.log(
            "createStockMovements"
        );

        await createStockMovements();


        // =================================================
        // 4. IMPORT
        // =================================================

        console.log(
            "createImports"
        );

        await createImports();


        console.log(
            "createImportItems"
        );

        await createImportItems();


        console.log(
            "createImportInvoice"
        );

        await createImportInvoice();


        // =================================================
        // 5. EXPORT
        // =================================================

        console.log(
            "createExports"
        );

        await createExports();


        console.log(
            "createExportItems"
        );

        await createExportItems();


        console.log(
            "createExportInvoice"
        );

        await createExportInvoice();


        // =================================================
        // 6. SYSTEM
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
        // 7. MACHINE / SYNC
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
        // 8. MIGRATION
        //
        // ต้องอยู่ท้ายสุด
        //
        // เพราะ Table ทั้งหมด
        // ต้องถูกสร้างก่อน
        //
        // =================================================

        await migrateDatabase();


        // =================================================
        // READY
        // =================================================

        console.log(
            ""
        );


        console.log(
            "======================================"
        );


        console.log(
            "Database Ready"
        );


        console.log(
            "======================================"
        );


        return true;


    } catch (
        error
    ) {

        console.error(
            "Database initialization failed:",
            error
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