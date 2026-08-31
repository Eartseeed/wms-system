const {
    run,
    all
} = require("../../config/database");


// =========================================================
// CHECK COLUMN
// =========================================================

async function columnExists(
    tableName,
    columnName
) {

    const columns = await all(
        `PRAGMA table_info(${tableName})`
    );

    return columns.some(
        column =>
            column.name === columnName
    );

}


// =========================================================
// ADD COLUMN IF MISSING
// =========================================================

async function addColumnIfMissing(
    tableName,
    columnName,
    definition
) {

    const exists =
        await columnExists(
            tableName,
            columnName
        );

    if (!exists) {

        console.log(
            `⚠️ Adding ${columnName} to ${tableName}...`
        );

        await run(`

            ALTER TABLE ${tableName}

            ADD COLUMN ${columnName} ${definition}

        `);

        console.log(
            `✓ ${columnName} added`
        );

    }

}


// =========================================================
// CREATE / MIGRATE EXPORT INVOICE
// =========================================================

module.exports = async () => {

    // =====================================================
    // 1. CREATE TABLE
    // =====================================================

    await run(`

        CREATE TABLE IF NOT EXISTS export_invoice (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            invoice_no TEXT,

            product_code TEXT,

            product_name TEXT,

            qty REAL DEFAULT 0,

            unit TEXT,

            unit_weight REAL DEFAULT 0,

            weight REAL DEFAULT 0,

            unit_price REAL DEFAULT 0,

            total_price REAL DEFAULT 0,

            supplier TEXT,

            invoice_date TEXT,

            invoice_file TEXT,

            payment_file TEXT,

            formd_file TEXT,

            phytos_file TEXT,

            tax_file TEXT,

            export_license_file TEXT,

            origin_file TEXT,

            acdd_file TEXT,

            created_at DATETIME
                DEFAULT CURRENT_TIMESTAMP,

            updated_at DATETIME
                DEFAULT CURRENT_TIMESTAMP

        )

    `);


    // =====================================================
    // 2. MIGRATE OLD DATABASE
    // =====================================================

    await addColumnIfMissing(
        "export_invoice",
        "invoice_no",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "product_code",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "product_name",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "qty",
        "REAL DEFAULT 0"
    );

    await addColumnIfMissing(
        "export_invoice",
        "unit",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "unit_weight",
        "REAL DEFAULT 0"
    );

    await addColumnIfMissing(
        "export_invoice",
        "weight",
        "REAL DEFAULT 0"
    );

    await addColumnIfMissing(
        "export_invoice",
        "unit_price",
        "REAL DEFAULT 0"
    );

    await addColumnIfMissing(
        "export_invoice",
        "total_price",
        "REAL DEFAULT 0"
    );

    await addColumnIfMissing(
        "export_invoice",
        "supplier",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "invoice_date",
        "TEXT"
    );


    // =====================================================
    // DOCUMENT COLUMNS
    // =====================================================

    await addColumnIfMissing(
        "export_invoice",
        "invoice_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "payment_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "formd_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "phytos_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "tax_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "export_license_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "origin_file",
        "TEXT"
    );

    await addColumnIfMissing(
        "export_invoice",
        "acdd_file",
        "TEXT"
    );


    // =====================================================
    // TIMESTAMP COLUMNS
    // =====================================================

    await addColumnIfMissing(
        "export_invoice",
        "created_at",
        "DATETIME"
    );

    await addColumnIfMissing(
        "export_invoice",
        "updated_at",
        "DATETIME"
    );


    // =====================================================
    // 3. INDEXES
    // =====================================================

    await run(`

        CREATE INDEX IF NOT EXISTS
        idx_export_invoice_no

        ON export_invoice(invoice_no)

    `);


    await run(`

        CREATE INDEX IF NOT EXISTS
        idx_export_product_code

        ON export_invoice(product_code)

    `);


    await run(`

        CREATE INDEX IF NOT EXISTS
        idx_export_supplier

        ON export_invoice(supplier)

    `);


    await run(`

        CREATE INDEX IF NOT EXISTS
        idx_export_invoice_date

        ON export_invoice(invoice_date)

    `);


    // =====================================================
    // 4. VERIFY TABLE
    // =====================================================

    const columns =
        await all(
            `PRAGMA table_info(export_invoice)`
        );


    console.log(
        "✓ export_invoice:",
        columns
            .map(column => column.name)
            .join(", ")
    );


    // =====================================================
    // 5. VERIFY REQUIRED COLUMNS
    // =====================================================

    const requiredColumns = [

        "invoice_no",

        "product_code",

        "product_name",

        "qty",

        "unit",

        "unit_weight",

        "weight",

        "total_price",

        "supplier",

        "invoice_date",

        "invoice_file",

        "payment_file",

        "formd_file",

        "phytos_file",

        "tax_file",

        "export_license_file",

        "origin_file",

        "acdd_file"

    ];


    const existingColumns =
        columns.map(
            column =>
                column.name
        );


    const missing =
        requiredColumns.filter(
            column =>
                !existingColumns.includes(
                    column
                )
        );


    if (missing.length > 0) {

        throw new Error(

            `export_invoice missing columns: ${
                missing.join(", ")
            }`

        );

    }


    console.log(
        "✓ export_invoice schema verified"
    );

};