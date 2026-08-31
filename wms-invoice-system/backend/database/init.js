const {
    db,
    run
} = require("../config/database");


// =========================================================
// SCHEMA
// =========================================================

const createRoles =
    require("./schema/roles");

const createPermissions =
    require("./schema/permissions");

const createUsers =
    require("./schema/users");

const createSuppliers =
    require("./schema/suppliers");

const createCustomers =
    require("./schema/customers");

const createStock =
    require("./schema/stock");

const createStockMovements =
    require("./schema/stockMovements");

const createImports =
    require("./schema/imports");

const createImportItems =
    require("./schema/importItems");

const createImportInvoice =
    require("./schema/importInvoice");

const createExports =
    require("./schema/exports");

const createExportItems =
    require("./schema/exportItems");

const createExportInvoice =
    require("./schema/exportInvoice");

const createNotifications =
    require("./schema/notifications");

const createSettings =
    require("./schema/settings");

const createUploads =
    require("./schema/uploads");

const createMachines =
    require("./schema/machines");

const createSyncLogs =
    require("./schema/syncLogs");

const createSyncQueue =
    require("./schema/syncQueue");


// =========================================================
// GET TABLE COLUMNS
// =========================================================

async function getTableColumns(
    tableName
) {

    return await new Promise(
        (resolve, reject) => {

            db.all(
                `PRAGMA table_info(${tableName})`,
                [],
                (err, rows) => {

                    if (err) {

                        return reject(err);

                    }

                    resolve(
                        rows || []
                    );

                }
            );

        }
    ).then(
        rows =>
            rows.map(
                row =>
                    row.name
            )
    );

}


// =========================================================
// CHECK TABLE EXISTS
// =========================================================

async function tableExists(
    tableName
) {

    const row =
        await new Promise(
            (resolve, reject) => {

                db.get(

                    `
                    SELECT name

                    FROM sqlite_master

                    WHERE type = 'table'

                    AND name = ?

                    LIMIT 1
                    `,

                    [tableName],

                    (err, result) => {

                        if (err) {

                            return reject(err);

                        }

                        resolve(result);

                    }

                );

            }
        );


    return !!row;

}


// =========================================================
// ENSURE COLUMN
// =========================================================

async function ensureColumn(
    tableName,
    columnName,
    columnDefinition
) {

    const exists =
        await tableExists(
            tableName
        );


    if (!exists) {

        console.warn(
            `⚠️ Table ${tableName} does not exist. Skip column ${columnName}`
        );

        return false;

    }


    const columns =
        await getTableColumns(
            tableName
        );


    if (
        columns.includes(
            columnName
        )
    ) {

        return false;

    }


    console.log(
        `>> Add column ${tableName}.${columnName}`
    );


    await run(`

        ALTER TABLE ${tableName}

        ADD COLUMN ${columnName}
        ${columnDefinition}

    `);


    return true;

}


// =========================================================
// DATABASE MIGRATION
// =========================================================

async function migrateDatabase() {

    console.log("");

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
        "unit_weight",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "stock",
        "total_weight",
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
        "DATE"
    );


    await ensureColumn(
        "stock",
        "expire_date",
        "DATE"
    );


    await ensureColumn(
        "stock",
        "receive_date",
        "DATE"
    );


    // =====================================================
    // STOCK MOVEMENTS
    // =====================================================

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


    // =====================================================
    // IMPORTS
    // =====================================================

    await ensureColumn(
        "imports",
        "unit_price",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "imports",
        "updated_at",
        "DATETIME"
    );


    // =====================================================
    // EXPORTS
    // =====================================================

    await ensureColumn(
        "exports",
        "customer_id",
        "INTEGER"
    );


    await ensureColumn(
        "exports",
        "invoice_no",
        "TEXT"
    );


    await ensureColumn(
        "exports",
        "so_no",
        "TEXT"
    );


    await ensureColumn(
        "exports",
        "export_date",
        "DATE"
    );


    await ensureColumn(
        "exports",
        "warehouse_id",
        "INTEGER"
    );


    await ensureColumn(
        "exports",
        "total_item",
        "INTEGER DEFAULT 0"
    );


    await ensureColumn(
        "exports",
        "total_qty",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "exports",
        "total_price",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "exports",
        "discount",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "exports",
        "vat",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "exports",
        "grand_total",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "exports",
        "status",
        "TEXT DEFAULT 'PENDING'"
    );


    await ensureColumn(
        "exports",
        "approved_by",
        "TEXT"
    );


    await ensureColumn(
        "exports",
        "approved_at",
        "DATETIME"
    );


    await ensureColumn(
        "exports",
        "completed_by",
        "TEXT"
    );


    await ensureColumn(
        "exports",
        "completed_at",
        "DATETIME"
    );


    await ensureColumn(
        "exports",
        "remark",
        "TEXT"
    );


    await ensureColumn(
        "exports",
        "created_by",
        "TEXT"
    );


    await ensureColumn(
        "exports",
        "updated_at",
        "DATETIME DEFAULT CURRENT_TIMESTAMP"
    );


    // =====================================================
    // VERIFY EXPORT INVOICE
    // =====================================================

    await ensureColumn(
        "export_invoice",
        "invoice_no",
        "TEXT"
    );


    await ensureColumn(
        "export_invoice",
        "product_code",
        "TEXT"
    );


    await ensureColumn(
        "export_invoice",
        "product_name",
        "TEXT"
    );


    await ensureColumn(
        "export_invoice",
        "qty",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "export_invoice",
        "unit",
        "TEXT"
    );


    await ensureColumn(
        "export_invoice",
        "unit_weight",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "export_invoice",
        "weight",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "export_invoice",
        "unit_price",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "export_invoice",
        "total_price",
        "REAL DEFAULT 0"
    );


    await ensureColumn(
        "export_invoice",
        "supplier",
        "TEXT"
    );


    await ensureColumn(
        "export_invoice",
        "invoice_date",
        "TEXT"
    );


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
    // FINISH
    // =====================================================

    console.log(
        "✓ Database Schema Check Complete"
    );

}


// =========================================================
// INITIALIZE DATABASE
// =========================================================

async function initializeDatabase() {

    console.log("");

    console.log(
        "======================================"
    );

    console.log(
        "Initialize CWMS Database"
    );

    console.log(
        "======================================"
    );


    // =====================================================
    // 1. CORE / SECURITY
    // =====================================================

    console.log(
        ">> createRoles"
    );

    await createRoles();


    console.log(
        ">> createPermissions"
    );

    await createPermissions();


    console.log(
        ">> createUsers"
    );

    await createUsers();


    // =====================================================
    // 2. MASTER DATA
    // =====================================================

    console.log(
        ">> createSuppliers"
    );

    await createSuppliers();


    console.log(
        ">> createCustomers"
    );

    await createCustomers();


    // =====================================================
    // 3. STOCK
    // =====================================================

    console.log(
        ">> createStock"
    );

    await createStock();


    console.log(
        ">> createStockMovements"
    );

    await createStockMovements();


    // =====================================================
    // 4. IMPORT
    // =====================================================

    console.log(
        ">> createImports"
    );

    await createImports();


    console.log(
        ">> createImportItems"
    );

    await createImportItems();


    console.log(
        ">> createImportInvoice"
    );

    await createImportInvoice();


    // =====================================================
    // 5. EXPORT
    // =====================================================

    console.log(
        ">> createExports"
    );

    await createExports();


    console.log(
        ">> createExportItems"
    );

    await createExportItems();


    console.log(
        ">> createExportInvoice"
    );

    await createExportInvoice();


    // =====================================================
    // 6. SYSTEM
    // =====================================================

    console.log(
        ">> createNotifications"
    );

    await createNotifications();


    console.log(
        ">> createSettings"
    );

    await createSettings();


    console.log(
        ">> createUploads"
    );

    await createUploads();


    // =====================================================
    // 7. MACHINE / SYNC
    // =====================================================

    console.log(
        ">> createMachines"
    );

    await createMachines();


    console.log(
        ">> createSyncLogs"
    );

    await createSyncLogs();


    console.log(
        ">> createSyncQueue"
    );

    await createSyncQueue();


    // =====================================================
    // 8. MIGRATION
    // =====================================================

    await migrateDatabase();


    // =====================================================
    // READY
    // =====================================================

    console.log("");

    console.log(
        "======================================"
    );

    console.log(
        "Database Ready"
    );

    console.log(
        "======================================"
    );

}


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    initializeDatabase,

    migrateDatabase,

    ensureColumn

};