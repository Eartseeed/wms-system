const {
    run,
    all
} =
   require("../../config/database")

// =========================================================
// STOCK MOVEMENTS SCHEMA
//
// Path:
//
// backend/database/schema/stockMovements.js
//
// =========================================================
//
// ตาราง:
//
// stock_movements
//
// หน้าที่:
//
// เก็บประวัติการเคลื่อนไหวของ Stock
//
// =========================================================
//
// FLOW
//
// IMPORT
//      ↓
// StockService.receive()
//      ↓
// stock เพิ่ม
//      ↓
// stock_movements
//
// EXPORT
//      ↓
// StockService.issue()
//      ↓
// stock ลด
//      ↓
// stock_movements
//
// EDIT IMPORT
//      ↓
// Reverse Stock เดิม
//      ↓
// Receive Stock ใหม่
//      ↓
// stock_movements
//
// EDIT EXPORT
//      ↓
// Reverse Stock เดิม
//      ↓
// Issue Stock ใหม่
//      ↓
// stock_movements
//
// =========================================================
//
// IMPORTANT
//
// ตารางนี้เป็น History / Audit Trail
//
// ไม่ควรแก้ Movement โดยตรง
//
// ไม่ควรลบ Movement เมื่อ:
//
// - Import ถูกลบ
// - Export ถูกลบ
//
// แต่ระบบควรสร้าง Movement ใหม่แบบ:
//
// REVERSE
//
// เพื่อเก็บประวัติให้ครบ
//
// =========================================================


// =========================================================
// ENSURE COLUMN
//
// หน้าที่:
//
// ตรวจสอบว่า Column มีอยู่แล้วหรือไม่
//
// ถ้าไม่มี:
//
// ALTER TABLE
// ADD COLUMN
//
// =========================================================
//
// สำคัญ:
//
// ใช้เพื่อ Migration ฐานข้อมูลเดิม
//
// ทำให้:
//
// - ไม่ต้องลบ Database
// - ไม่ต้องเสียข้อมูลเดิม
// - ระบบเก่าสามารถ Update Schema ได้
//
// =========================================================

async function ensureColumn(
    tableName,
    columnName,
    columnDefinition
) {

    const columns =
        await all(
            `PRAGMA table_info(${tableName})`
        );


    const exists =
        columns.some(
            (
                column
            ) =>
                column.name ===
                columnName
        );


    if (
        exists
    ) {

        return;

    }


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
        `Migration: Added ${tableName}.${columnName}`
    );

}


// =========================================================
// ENSURE INDEX
//
// SQLite ไม่มี:
//
// CREATE INDEX IF NOT EXISTS
//
// ในบาง environment อาจใช้งานได้ไม่เหมือนกัน
//
// Function นี้จึงสร้าง Index แบบ Safe
//
// =========================================================

async function ensureIndex(
    indexName,
    tableName,
    columns
) {

    try {

        await run(
            `
                CREATE INDEX IF NOT EXISTS
                ${indexName}

                ON
                ${tableName}

                (
                    ${columns}
                )
            `
        );

    } catch (
        error
    ) {

        console.error(
            `Index creation error ${indexName}:`,
            error.message
        );

    }

}


// =========================================================
// CREATE STOCK MOVEMENTS TABLE
//
// Schema หลัก
//
// =========================================================

async function createStockMovements() {

    // =====================================================
    // CREATE TABLE
    //
    // CREATE IF NOT EXISTS
    //
    // เพื่อไม่ให้ข้อมูลเดิมหาย
    //
    // =====================================================

    await run(
        `
            CREATE TABLE IF NOT EXISTS
            stock_movements
            (

                -- =========================================
                -- PRIMARY KEY
                -- =========================================

                id
                    INTEGER
                    PRIMARY KEY
                    AUTOINCREMENT,


                -- =========================================
                -- MOVEMENT NUMBER
                --
                -- ตัวอย่าง:
                --
                -- IMP-1
                -- IMP-1-EDIT
                -- IMP-1-REVERSE
                -- EXP-1
                -- EXP-1-DELETE
                --
                -- ใช้เป็นเลขอ้างอิงของ Movement
                -- =========================================

                movement_no
                    TEXT,


                -- =========================================
                -- PRODUCT
                --
                -- ระบบ Program 2
                -- ไม่มี Product Master แยก
                --
                -- จึงเก็บ:
                --
                -- Product Number
                -- Product Name
                --
                -- ลงใน Movement โดยตรง
                -- =========================================

                product_code
                    TEXT
                    NOT NULL,


                product_name
    TEXT,

unit
    TEXT,


                -- =========================================
                -- STOCK ID
                --
                -- ID ของ Stock Record
                --
                -- สามารถเป็น NULL ได้
                -- เพื่อรองรับ:
                --
                -- History เก่า
                -- Movement จากหลายระบบ
                -- =========================================

                stock_id
                    INTEGER,


                -- =========================================
                -- REFERENCE
                --
                -- ตัวอย่าง:
                --
                -- IMPORT
                -- EXPORT
                -- IMPORT_EDIT
                -- EXPORT_EDIT
                -- IMPORT_DELETE
                -- EXPORT_DELETE
                --
                -- reference_no:
                --
                -- Invoice No
                -- Export No
                -- Document No
                --
                -- =========================================

                reference_type
                    TEXT,


                reference_no
                    TEXT,


                -- =========================================
                -- MOVEMENT TYPE
                --
                -- ตัวอย่าง:
                --
                -- IN
                -- OUT
                -- RECEIVE
                -- ISSUE
                --
                -- การ Reverse
                --
                -- Reverse Import:
                -- OUT
                --
                -- Reverse Export:
                -- IN
                --
                -- เพื่อให้ qty สามารถอ่านทิศทางได้
                -- =========================================

                movement_type
                    TEXT
                    NOT NULL,


                -- =========================================
                -- QUANTITY
                --
                -- เก็บจำนวนที่เคลื่อนไหว
                --
                -- ใช้เป็น Positive Number
                --
                -- ทิศทางดูจาก movement_type
                -- =========================================

                qty
                    REAL
                    NOT NULL
                    DEFAULT 0,


                -- =========================================
                -- STOCK BALANCE
                --
                -- before_qty
                -- after_qty
                --
                -- เพื่อให้ตรวจสอบย้อนหลังได้ว่า:
                --
                -- ก่อน Movement มีเท่าไร
                -- หลัง Movement เหลือเท่าไร
                -- =========================================

                before_qty
                    REAL
                    DEFAULT 0,


                after_qty
                    REAL
                    DEFAULT 0,


                -- =========================================
                -- COST
                --
                -- unit_cost
                -- total_cost
                --
                -- ใช้เก็บต้นทุน ณ เวลาที่เกิด Movement
                --
                -- เพื่อไม่ให้ Report ในอนาคต
                -- เปลี่ยนตามราคาปัจจุบัน
                -- =========================================

                unit_cost
                    REAL
                    DEFAULT 0,


                total_cost
                    REAL
                    DEFAULT 0,


                -- =========================================
                -- WAREHOUSE
                --
                -- warehouse_from
                -- warehouse_to
                --
                -- รองรับ:
                --
                -- RECEIVE
                -- ISSUE
                -- TRANSFER
                --
                -- =========================================

                warehouse_from
                    INTEGER,


                warehouse_to
                    INTEGER,


                -- =========================================
                -- LOCATION
                --
                -- location_from
                -- location_to
                --
                -- รองรับ:
                --
                -- RECEIVE
                -- ISSUE
                -- TRANSFER
                --
                -- =========================================

                location_from
                    TEXT,


                location_to
                    TEXT,


                -- =========================================
                -- LOT / BATCH / SERIAL
                --
                -- ใช้สำหรับตรวจสอบย้อนหลัง
                --
                -- =========================================

                lot_no
                    TEXT,


                batch_no
                    TEXT,


                serial_no
                    TEXT,


                -- =========================================
                -- REMARK
                --
                -- เก็บคำอธิบายเพิ่มเติม
                --
                -- ตัวอย่าง:
                --
                -- Import Invoice INV-001
                --
                -- Reverse Import #5
                -- =========================================

                remark
                    TEXT,


                -- =========================================
                -- CREATED BY
                --
                -- Username จาก JWT
                -- =========================================

                created_by
                    TEXT,


                -- =========================================
                -- CREATED AT
                --
                -- เวลาที่เกิด Movement
                -- =========================================

                created_at
                    DATETIME
                    DEFAULT CURRENT_TIMESTAMP

            )
        `
    );


    // =====================================================
    // MIGRATION
    //
    // รองรับ Database เดิม
    //
    // หาก Table ถูกสร้างมาก่อน
    // ระบบจะเพิ่ม Column ที่ขาด
    //
    // =====================================================


    // =====================================================
    // MOVEMENT NUMBER
    // =====================================================

    await ensureColumn(
        "stock_movements",
        "movement_no",
        "TEXT"
    );


    // =====================================================
    // PRODUCT
    // =====================================================

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
    "unit",
    "TEXT"
);


    // =====================================================
    // STOCK
    // =====================================================

    await ensureColumn(
        "stock_movements",
        "stock_id",
        "INTEGER"
    );


    // =====================================================
    // REFERENCE
    // =====================================================

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


    // =====================================================
    // MOVEMENT TYPE
    // =====================================================

    await ensureColumn(
        "stock_movements",
        "movement_type",
        "TEXT"
    );


    // =====================================================
    // QUANTITY
    // =====================================================

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


    // =====================================================
    // COST
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


    // =====================================================
    // WAREHOUSE
    // =====================================================

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


    // =====================================================
    // LOCATION
    // =====================================================

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


    // =====================================================
    // LOT / BATCH / SERIAL
    // =====================================================

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
    // REMARK
    // =====================================================

    await ensureColumn(
        "stock_movements",
        "remark",
        "TEXT"
    );


    // =====================================================
    // CREATED BY
    // =====================================================

    await ensureColumn(
        "stock_movements",
        "created_by",
        "TEXT"
    );


    // =====================================================
    // CREATED AT
    // =====================================================

    await ensureColumn(
        "stock_movements",
        "created_at",
        "DATETIME"
    );


    // =====================================================
    // INDEXES
    //
    // เพิ่มความเร็วในการ:
    //
    // - Dashboard
    // - Report
    // - Product History
    // - Reference Search
    // - Date Filter
    //
    // =====================================================


    // -----------------------------------------------------
    // MOVEMENT NUMBER
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_movement_no",
        "stock_movements",
        "movement_no"
    );


    // -----------------------------------------------------
    // PRODUCT
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_product_code",
        "stock_movements",
        "product_code"
    );


    // -----------------------------------------------------
    // STOCK ID
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_stock_id",
        "stock_movements",
        "stock_id"
    );


    // -----------------------------------------------------
    // REFERENCE
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_reference",
        "stock_movements",
        "reference_type, reference_no"
    );


    // -----------------------------------------------------
    // MOVEMENT TYPE
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_movement_type",
        "stock_movements",
        "movement_type"
    );


    // -----------------------------------------------------
    // CREATED AT
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_created_at",
        "stock_movements",
        "created_at"
    );


    // -----------------------------------------------------
    // PRODUCT + DATE
    //
    // ใช้บ่อยสำหรับ:
    //
    // Product History
    // Report
    // -----------------------------------------------------

    await ensureIndex(
        "idx_stock_movements_product_date",
        "stock_movements",
        "product_code, created_at"
    );


    console.log(
        "Stock movements schema initialized"
    );

}


// =========================================================
// EXPORT
//
// init.js:
//
// const createStockMovements =
//     require("./schema/stockMovements");
//
// await createStockMovements();
//
// =========================================================

module.exports =
    createStockMovements;