const {
    all,
    get,
    run
} = require(
    "../config/database"
);


const StockService =
    require(
        "./stockService"
    );


const fs =
    require(
        "fs"
    );


const path =
    require(
        "path"
    );


// =========================================================
// IMPORT SERVICE
//
// PROGRAM 2
//
// ไม่มี Product Master
//
// Product Number + Product Name
// เก็บตรงใน Import / Stock
//
// =========================================================
//
// FLOW
//
// CREATE IMPORT
//
// Import Invoice
//      ↓
// imports
//      ↓
// StockService.receive()
//      ↓
// Stock
//
// =========================================================
//
// EDIT IMPORT
//
// Import เดิม
//      ↓
// Reverse Stock เดิม
//      ↓
// Receive Stock ใหม่
//      ↓
// Update Import
//
// ถ้า Update ไม่สำเร็จ:
//
// Reverse Stock ใหม่
//      ↓
// Restore Stock เดิม
//
// =========================================================
//
// FILE
//
// Upload ใหม่
//      ↓
// เก็บชื่อไฟล์ใน imports
//
// Delete File
//      ↓
// ลบไฟล์จริง
//      ↓
// เคลียร์ชื่อไฟล์ใน Database
//
// =========================================================
//
// DELETE IMPORT
//
// Import
//      ↓
// Reverse Stock
//      ↓
// Delete Import
//      ↓
// Delete Physical Files
//
// =========================================================
//
// IMPORTANT
//
// Import table:
//     เก็บข้อมูล Invoice
//
// Stock table:
//     เก็บข้อมูล Warehouse / Location / Lot / Batch
//
// Import ไม่มี Product Master
//
// Product Number ต้องเป็นตัวเลขเท่านั้น
//
// =========================================================


class ImportService {


    // =====================================================
    // FILE FIELDS
    //
    // รายชื่อไฟล์ทั้งหมดของ Import
    //
    // ต้องตรงกับ:
    //
    // - Frontend
    // - routes/imports.js
    // - Database
    //
    // =====================================================

    fileFields() {

        return [

            "invoice_file",

            "acdd_file",

            "formd_file",

            "truck_file",

            "payment_file",

            "fda_file",

            "import_license_file"

        ];

    }


    // =====================================================
    // GET UPLOAD DIRECTORY
    //
    // Folder จริง:
    //
    // backend/uploads
    //
    // =====================================================

    getUploadDirectory() {

        return path.join(

            __dirname,

            "..",

            "uploads"

        );

    }


    // =====================================================
    // DELETE PHYSICAL FILE
    //
    // ใช้ลบไฟล์จริงจาก:
    //
    // backend/uploads
    //
    // =====================================================
    //
    // IMPORTANT
    //
    // ถ้าไฟล์ไม่มีอยู่แล้ว:
    //
    // ไม่ถือว่าเป็น Error
    //
    // =====================================================

    async deletePhysicalFile(
        filename
    ) {

        if (
            !filename
        ) {

            return;

        }


        const value =
            String(
                filename
            ).trim();


        if (
            !value
        ) {

            return;

        }


        // -------------------------------------------------
        // ป้องกัน Path Traversal
        //
        // ตัวอย่าง:
        //
        // ../../database/wms.db
        //
        // จะถูกเหลือเฉพาะชื่อไฟล์
        // -------------------------------------------------

        const safeName =
            path.basename(
                value
            );


        const filePath =
            path.join(

                this.getUploadDirectory(),

                safeName

            );


        try {

            await fs.promises.unlink(
                filePath
            );

        } catch (
            error
        ) {

            // -------------------------------------------------
            // ไฟล์ถูกลบไปแล้ว
            //
            // ถือว่าสำเร็จ
            // -------------------------------------------------

            if (
                error.code ===
                "ENOENT"
            ) {

                return;

            }


            // -------------------------------------------------
            // Error อื่น
            //
            // ไม่ทำให้ Import พัง
            // แต่บันทึก Log ไว้ตรวจสอบ
            // -------------------------------------------------

            console.error(

                "Delete physical file error:",

                filePath,

                error

            );

        }

    }


    // =====================================================
    // GET ALL IMPORTS
    //
    // GET:
    //
    // /api/imports
    //
    // ใช้สำหรับ:
    //
    // - Import Invoice
    // - Dashboard
    // - Report
    //
    // =====================================================

    async getAll() {

        return await all(`

            SELECT *

            FROM imports

            ORDER BY id DESC

        `);

    }


    // =====================================================
    // GET IMPORT BY ID
    //
    // ใช้สำหรับ:
    //
    // - เปิดรายละเอียด
    // - Edit
    // - Delete
    // - Delete File
    //
    // =====================================================

    async getById(
        id
    ) {

        const importId =
            Number(
                id
            );


        // -------------------------------------------------
        // ตรวจสอบ ID
        // -------------------------------------------------

        if (

            !Number.isInteger(
                importId
            )

            ||

            importId <= 0

        ) {

            throw new Error(
                "Import ID is invalid"
            );

        }


        return await get(`

            SELECT *

            FROM imports

            WHERE id = ?

            LIMIT 1

        `, [

            importId

        ]);

    }


    // =====================================================
    // FIND IMPORT BY INVOICE
    //
    // Invoice เดียวกัน
    // สามารถมีหลาย Product
    //
    // ดังนั้นใช้ all()
    //
    // =====================================================

    async findByInvoice(
        invoiceNo
    ) {

        const value =
            String(
                invoiceNo ??
                ""
            ).trim();


        if (
            !value
        ) {

            return null;

        }


        return await all(`

            SELECT *

            FROM imports

            WHERE invoice_no = ?

            ORDER BY id DESC

        `, [

            value

        ]);

    }


    // =====================================================
    // NORMALIZE ID
    //
    // ใช้ใน Route ที่ต้องการ ID ที่ถูกต้อง
    //
    // =====================================================

    normalizeId(
        id
    ) {

        const value =
            Number(
                id
            );


        if (

            !Number.isInteger(
                value
            )

            ||

            value <= 0

        ) {

            throw new Error(
                "Import ID is invalid"
            );

        }


        return value;

    }


    // =====================================================
    // BUILD PRODUCT
    //
    // PROGRAM 2 ไม่มี Product Master
    //
    // Product จึงมาจาก Import โดยตรง
    //
    // รองรับทั้ง:
    //
    // product_code
    //
    // และ:
    //
    // product_number
    //
    // =====================================================

    buildProduct(
        data = {},
        old = null
    ) {

        const code =
            String(

                data.product_code ??

                data.product_number ??

                old?.product_code ??

                ""

            ).trim();


        // -------------------------------------------------
        // Product Number ต้องมี
        // -------------------------------------------------

        if (
            !code
        ) {

            throw new Error(
                "Product number is required"
            );

        }


        // -------------------------------------------------
        // Product Number ต้องเป็นตัวเลขเท่านั้น
        //
        // ตัวอย่างที่ถูก:
        //
        // 10001
        // 10002
        //
        // ตัวอย่างที่ไม่ถูก:
        //
        // ABC10001
        // P-10001
        //
        // -------------------------------------------------

        if (
            !/^\d+$/.test(
                code
            )
        ) {

            throw new Error(
                "Product number must contain numbers only"
            );

        }


        const name =
            String(

                data.product_name ??

                old?.product_name ??

                ""

            ).trim();


        // -------------------------------------------------
        // Product Name ต้องมี
        // -------------------------------------------------

        if (
            !name
        ) {

            throw new Error(
                "Product name is required"
            );

        }


        return {

            code,

            name

        };

    }


    // =====================================================
    // CALCULATE IMPORT
    //
    // คำนวณ:
    //
    // - Quantity
    // - Unit Weight
    // - Total Weight
    // - Total Price
    // - Unit Price
    //
    // =====================================================

    calculate(
        data = {},
        old = null
    ) {

        // -------------------------------------------------
        // QUANTITY
        //
        // รองรับ:
        //
        // qty
        // quantity
        //
        // =================================================

        const qty =
            Number(

                data.qty ??

                data.quantity ??

                old?.qty ??

                0

            );


        if (

            !Number.isFinite(
                qty
            )

            ||

            qty <= 0

        ) {

            throw new Error(
                "Import quantity must be greater than 0"
            );

        }


        // -------------------------------------------------
        // UNIT WEIGHT
        // -------------------------------------------------

        const unitWeight =
            Number(

                data.unit_weight ??

                old?.unit_weight ??

                0

            );


        if (

            !Number.isFinite(
                unitWeight
            )

            ||

            unitWeight < 0

        ) {

            throw new Error(
                "Unit weight is invalid"
            );

        }


        // -------------------------------------------------
        // TOTAL WEIGHT
        //
        // ถ้า Frontend ส่ง weight มา:
        //
        // ใช้ค่าที่ส่งมา
        //
        // ถ้าไม่ได้ส่ง:
        //
        // qty × unit_weight
        //
        // =================================================

        const suppliedWeight =

            data.weight ??

            old?.weight;


        const totalWeight =

            suppliedWeight !==
                undefined

            &&

            suppliedWeight !==
                null

            &&

            suppliedWeight !==
                ""

                ? Number(
                    suppliedWeight
                )

                : (

                    qty *
                    unitWeight

                );


        if (

            !Number.isFinite(
                totalWeight
            )

            ||

            totalWeight < 0

        ) {

            throw new Error(
                "Total weight is invalid"
            );

        }


        // -------------------------------------------------
        // TOTAL PRICE
        // -------------------------------------------------

        const totalPrice =
            Number(

                data.total_price ??

                old?.total_price ??

                0

            );


        if (

            !Number.isFinite(
                totalPrice
            )

            ||

            totalPrice < 0

        ) {

            throw new Error(
                "Total price is invalid"
            );

        }


        // -------------------------------------------------
        // UNIT PRICE
        //
        // ราคาต่อหน่วย =
        //
        // Total Price ÷ Quantity
        //
        // Backend เป็นตัวคำนวณหลัก
        // -------------------------------------------------

        const unitPrice =

            qty > 0

                ? (
                    totalPrice /
                    qty
                )

                : 0;


        if (

            !Number.isFinite(
                unitPrice
            )

            ||

            unitPrice < 0

        ) {

            throw new Error(
                "Unit price is invalid"
            );

        }


        return {

            qty,

            unitWeight,

            totalWeight,

            totalPrice,

            unitPrice

        };

    }


    // =====================================================
    // BUILD IMPORT VALUES
    //
    // รวมข้อมูล:
    //
    // - Invoice
    // - Product
    // - Quantity
    // - Weight
    // - Price
    // - Supplier
    // - Files
    //
    // =====================================================
    //
    // UPDATE:
    //
    // ถ้าไม่ได้ส่งไฟล์ใหม่
    // จะใช้ไฟล์เดิม
    //
    // =====================================================

    buildValues(
        data = {},
        product,
        calc,
        old = null
    ) {

        return {

            // -------------------------------------------------
            // INVOICE
            // -------------------------------------------------

            invoice_no:

                String(

                    data.invoice_no ??

                    old?.invoice_no ??

                    ""

                ).trim(),


            // -------------------------------------------------
            // PRODUCT
            // -------------------------------------------------

            product_code:
                product.code,


            product_name:
                product.name,


            // -------------------------------------------------
            // QUANTITY
            // -------------------------------------------------

            qty:
                calc.qty,


            // -------------------------------------------------
            // UNIT
            // -------------------------------------------------

            unit:

                String(

                    data.unit ??

                    old?.unit ??

                    ""

                ).trim(),


            // -------------------------------------------------
            // WEIGHT
            // -------------------------------------------------

            unit_weight:
                calc.unitWeight,


            weight:
                calc.totalWeight,


            // -------------------------------------------------
            // PRICE
            // -------------------------------------------------

            unit_price:
                calc.unitPrice,


            total_price:
                calc.totalPrice,


            // -------------------------------------------------
            // SUPPLIER
            // -------------------------------------------------

            supplier:

                String(

                    data.supplier ??

                    old?.supplier ??

                    ""

                ).trim(),


            // -------------------------------------------------
            // INVOICE DATE
            // -------------------------------------------------

            invoice_date:

                data.invoice_date ??

                old?.invoice_date ??

                null,


            // -------------------------------------------------
            // DOCUMENT FILES
            //
            // ถ้ามีไฟล์ใหม่:
            //     ใช้ไฟล์ใหม่
            //
            // ถ้าไม่มี:
            //     ใช้ไฟล์เดิม
            //
            // -------------------------------------------------

            invoice_file:

                data.invoice_file ??

                old?.invoice_file ??

                "",


            acdd_file:

                data.acdd_file ??

                old?.acdd_file ??

                "",


            formd_file:

                data.formd_file ??

                old?.formd_file ??

                "",


            truck_file:

                data.truck_file ??

                old?.truck_file ??

                "",


            payment_file:

                data.payment_file ??

                old?.payment_file ??

                "",


            fda_file:

                data.fda_file ??

                old?.fda_file ??

                "",


            import_license_file:

                data.import_license_file ??

                old?.import_license_file ??

                ""

        };

    }


    // =====================================================
    // BUILD STOCK OPTIONS
    //
    // ใช้เฉพาะข้อมูลที่ต้องส่งให้ StockService
    //
    // Import ไม่ได้เก็บ:
    //
    // warehouse
    // location
    // rack
    // shelf
    // bin
    // lot
    // batch
    // serial
    //
    // เป็นข้อมูลหลัก
    //
    // แต่ถ้า Frontend ส่งมา
    // จะส่งต่อให้ StockService
    //
    // =====================================================

    stockOptions(
        data = {},
        product,
        calc,
        invoiceNo,
        movementNo,
        type
    ) {

        return {

            // -------------------------------------------------
            // PRODUCT
            // -------------------------------------------------

            product_name:
                product.name,


            // -------------------------------------------------
            // MOVEMENT
            // -------------------------------------------------

            movement_no:
                movementNo,


            reference_type:
                type,


            reference_no:
                invoiceNo,


            // -------------------------------------------------
            // WEIGHT
            // -------------------------------------------------

            unit_weight:
                calc.unitWeight,


            total_weight:
                calc.totalWeight,


            // -------------------------------------------------
            // COST
            // -------------------------------------------------

            unit_cost:
                calc.unitPrice,


            total_cost:
                calc.totalPrice,


            // -------------------------------------------------
            // WAREHOUSE
            // -------------------------------------------------

            warehouse_id:
                data.warehouse_id ??
                null,


            // -------------------------------------------------
            // LOCATION
            // -------------------------------------------------

            location:
                data.location ??
                "",


            // -------------------------------------------------
            // RACK
            // -------------------------------------------------

            rack:
                data.rack ??
                "",


            // -------------------------------------------------
            // SHELF
            // -------------------------------------------------

            shelf:
                data.shelf ??
                "",


            // -------------------------------------------------
            // BIN
            // -------------------------------------------------

            bin:
                data.bin ??
                "",


            // -------------------------------------------------
            // LOT
            // -------------------------------------------------

            lot_no:
                data.lot_no ??
                "",


            // -------------------------------------------------
            // BATCH
            // -------------------------------------------------

            batch_no:
                data.batch_no ??
                "",


            // -------------------------------------------------
            // SERIAL
            // -------------------------------------------------

            serial_no:
                data.serial_no ??
                "",


            // -------------------------------------------------
            // DATES
            // -------------------------------------------------

            manufacture_date:
                data.manufacture_date ??
                null,


            expire_date:
                data.expire_date ??
                null,


            receive_date:
                data.receive_date ??
                data.invoice_date ??
                null,


            // -------------------------------------------------
            // REMARK
            // -------------------------------------------------

            remark:
                data.remark ??
                `Import Invoice ${invoiceNo}`,


            // -------------------------------------------------
            // USER
            // -------------------------------------------------

            created_by:
                data.created_by ??
                ""

        };

    }
        // =====================================================
    // CREATE IMPORT
    //
    // 1. Validate Import
    // 2. Insert Import
    // 3. Receive Stock
    //
    // ถ้า Stock ไม่สำเร็จ
    // ลบ Import ที่เพิ่งสร้าง
    // =====================================================

    async create(data = {}) {

        // -------------------------------------------------
        // BUILD PRODUCT
        // -------------------------------------------------

        const product =
            this.buildProduct(
                data
            );


        // -------------------------------------------------
        // CALCULATE
        // -------------------------------------------------

        const calc =
            this.calculate(
                data
            );


        // -------------------------------------------------
        // BUILD VALUES
        // -------------------------------------------------

        const values =
            this.buildValues(
                data,
                product,
                calc
            );


        // -------------------------------------------------
        // REQUIRED
        // -------------------------------------------------

        if (!values.invoice_no) {

            throw new Error(
                "Invoice No is required"
            );

        }


        if (!values.invoice_date) {

            throw new Error(
                "Invoice Date is required"
            );

        }


        // -------------------------------------------------
        // DUPLICATE
        //
        // Invoice เดียวกัน
        // + Product เดียวกัน
        // ห้ามสร้างซ้ำ
        // -------------------------------------------------

        const duplicate =
            await get(`
                SELECT id
                FROM imports
                WHERE invoice_no = ?
                AND product_code = ?
                LIMIT 1
            `, [

                values.invoice_no,

                values.product_code

            ]);


        if (duplicate) {

            throw new Error(
                "Import already exists for this invoice and product"
            );

        }


        // -------------------------------------------------
        // INSERT IMPORT
        // -------------------------------------------------

        const result =
            await run(`
                INSERT INTO imports (

                    invoice_no,

                    product_code,

                    product_name,

                    qty,

                    unit,

                    unit_weight,

                    weight,

                    unit_price,

                    total_price,

                    supplier,

                    invoice_date,

                    invoice_file,

                    acdd_file,

                    formd_file,

                    truck_file,

                    payment_file,

                    fda_file,

                    import_license_file

                )

                VALUES (
                    ?,?,?,?,?,?,?,?,?,?,
                    ?,?,?,?,?,?,?,?
                )
            `, [

                values.invoice_no,

                values.product_code,

                values.product_name,

                values.qty,

                values.unit,

                values.unit_weight,

                values.weight,

                values.unit_price,

                values.total_price,

                values.supplier,

                values.invoice_date,

                values.invoice_file,

                values.acdd_file,

                values.formd_file,

                values.truck_file,

                values.payment_file,

                values.fda_file,

                values.import_license_file

            ]);


        if (!result?.id) {

            throw new Error(
                "Failed to create import"
            );

        }


        // -------------------------------------------------
        // ADD STOCK
        // -------------------------------------------------

        try {

            const stock =
                await StockService.receive(

                    product.code,

                    calc.qty,

                    this.stockOptions(

                        data,

                        product,

                        calc,

                        values.invoice_no,

                        `IMP-${result.id}`,

                        "IMPORT"

                    )

                );


            return {

                id:
                    result.id,

                changes:
                    result.changes,

                invoice_no:
                    values.invoice_no,

                product_code:
                    product.code,

                product_name:
                    product.name,

                qty:
                    calc.qty,

                unit:
                    values.unit,

                unit_weight:
                    calc.unitWeight,

                total_weight:
                    calc.totalWeight,

                unit_price:
                    calc.unitPrice,

                total_price:
                    calc.totalPrice,

                stock

            };

        } catch (error) {

            // -------------------------------------------------
            // STOCK FAILED
            // REMOVE IMPORT
            // -------------------------------------------------

            try {

                await run(`
                    DELETE FROM imports
                    WHERE id = ?
                `, [
                    result.id
                ]);

            } catch (deleteError) {

                console.error(
                    `IMPORT CREATE CLEANUP ERROR #${result.id}:`,
                    deleteError
                );

            }


            throw error;

        }

    }


    // =====================================================
    // UPDATE IMPORT
    //
    // 1. อ่าน Import เดิม
    // 2. Validate Import ใหม่
    // 3. Reverse Stock เดิม
    // 4. Receive Stock ใหม่
    // 5. Update Import
    //
    // ถ้า Update Import ไม่สำเร็จ
    // 6. Reverse Stock ใหม่
    // 7. Restore Stock เดิม
    // =====================================================

    async update(
        id,
        data = {}
    ) {

        // -------------------------------------------------
        // GET OLD IMPORT
        // -------------------------------------------------

        const old =
            await this.getById(
                id
            );


        if (!old) {

            throw new Error(
                "Import not found"
            );

        }


        // -------------------------------------------------
        // BUILD NEW PRODUCT
        // -------------------------------------------------

        const product =
            this.buildProduct(
                data,
                old
            );


        // -------------------------------------------------
        // CALCULATE NEW VALUE
        // -------------------------------------------------

        const calc =
            this.calculate(
                data,
                old
            );


        // -------------------------------------------------
        // BUILD VALUES
        // -------------------------------------------------

        const values =
            this.buildValues(
                data,
                product,
                calc,
                old
            );


        // -------------------------------------------------
        // REQUIRED
        // -------------------------------------------------

        if (!values.invoice_no) {

            throw new Error(
                "Invoice No is required"
            );

        }


        if (!values.invoice_date) {

            throw new Error(
                "Invoice Date is required"
            );

        }


        // -------------------------------------------------
        // DUPLICATE
        //
        // Invoice เดียวกัน
        // + Product เดียวกัน
        // แต่ต้องไม่ใช่ ID เดิม
        // -------------------------------------------------

        const duplicate =
            await get(`
                SELECT id
                FROM imports
                WHERE invoice_no = ?
                AND product_code = ?
                AND id != ?
                LIMIT 1
            `, [

                values.invoice_no,

                values.product_code,

                id

            ]);


        if (duplicate) {

            throw new Error(
                "Import already exists for this invoice and product"
            );

        }


        // -------------------------------------------------
        // OLD QUANTITY
        // -------------------------------------------------

        const oldQty =
            Number(
                old.qty || 0
            );


        if (

            !Number.isFinite(
                oldQty
            )

            ||

            oldQty <= 0

        ) {

            throw new Error(
                "Old import quantity is invalid"
            );

        }


        // -------------------------------------------------
        // OLD PRICE
        // -------------------------------------------------

        const oldTotalPrice =
            Number(
                old.total_price || 0
            );


        if (

            !Number.isFinite(
                oldTotalPrice
            )

            ||

            oldTotalPrice < 0

        ) {

            throw new Error(
                "Old import total price is invalid"
            );

        }


        const oldUnitCost =

            oldQty > 0

                ? (
                    oldTotalPrice /
                    oldQty
                )

                : 0;


        // -------------------------------------------------
        // OLD PRODUCT
        // -------------------------------------------------

        const oldProductCode =
            String(
                old.product_code ||
                ""
            ).trim();


        if (
            !/^\d+$/.test(
                oldProductCode
            )
        ) {

            throw new Error(
                "Old product number is invalid"
            );

        }


        // -------------------------------------------------
        // REVERSE OLD STOCK
        // -------------------------------------------------

        await StockService.reverseReceive(

            oldProductCode,

            oldQty,

            {

                movement_no:
                    `IMP-${id}-EDIT-REVERSE`,

                reference_type:
                    "IMPORT_EDIT",

                reference_no:
                    old.invoice_no ||
                    "",

                unit_cost:
                    oldUnitCost,

                total_cost:
                    oldTotalPrice,

                remark:
                    `Reverse Import Edit #${id}`

            }

        );


        let newStock;


        // -------------------------------------------------
        // RECEIVE NEW STOCK
        // -------------------------------------------------

        try {

            newStock =
                await StockService.receive(

                    product.code,

                    calc.qty,

                    this.stockOptions(

                        data,

                        product,

                        calc,

                        values.invoice_no,

                        `IMP-${id}-EDIT`,

                        "IMPORT_EDIT"

                    )

                );

        } catch (error) {

            // -------------------------------------------------
            // NEW STOCK FAILED
            //
            // RESTORE OLD STOCK
            // -------------------------------------------------

            try {

                await StockService.receive(

                    oldProductCode,

                    oldQty,

                    {

                        product_name:
                            old.product_name ||
                            "",

                        movement_no:
                            `IMP-${id}-RESTORE-OLD`,

                        reference_type:
                            "IMPORT_EDIT_ROLLBACK",

                        reference_no:
                            old.invoice_no ||
                            "",

                        unit_weight:
                            Number(
                                old.unit_weight ||
                                0
                            ),

                        total_weight:
                            Number(
                                old.weight ||
                                0
                            ),

                        unit_cost:
                            oldUnitCost,

                        total_cost:
                            oldTotalPrice,

                        remark:
                            `Restore Old Import #${id}`

                    }

                );

            } catch (restoreError) {

                console.error(
                    `IMPORT EDIT RESTORE ERROR #${id}:`,
                    restoreError
                );

            }


            throw error;

        }


        // -------------------------------------------------
        // UPDATE IMPORT
        // -------------------------------------------------

        try {

            const result =
                await run(`
                    UPDATE imports SET

                        invoice_no=?,

                        product_code=?,

                        product_name=?,

                        qty=?,

                        unit=?,

                        unit_weight=?,

                        weight=?,

                        unit_price=?,

                        total_price=?,

                        supplier=?,

                        invoice_date=?,

                        invoice_file=?,

                        acdd_file=?,

                        formd_file=?,

                        truck_file=?,

                        payment_file=?,

                        fda_file=?,

                        import_license_file=?,

                        updated_at=CURRENT_TIMESTAMP

                    WHERE id=?
                `, [

                    values.invoice_no,

                    values.product_code,

                    values.product_name,

                    values.qty,

                    values.unit,

                    values.unit_weight,

                    values.weight,

                    values.unit_price,

                    values.total_price,

                    values.supplier,

                    values.invoice_date,

                    values.invoice_file,

                    values.acdd_file,

                    values.formd_file,

                    values.truck_file,

                    values.payment_file,

                    values.fda_file,

                    values.import_license_file,

                    id

                ]);


            if (!result) {

                throw new Error(
                    "Failed to update import"
                );

            }


            return {

                ...result,

                id,

                invoice_no:
                    values.invoice_no,

                product_code:
                    product.code,

                product_name:
                    product.name,

                qty:
                    calc.qty,

                unit:
                    values.unit,

                unit_weight:
                    calc.unitWeight,

                total_weight:
                    calc.totalWeight,

                unit_price:
                    calc.unitPrice,

                total_price:
                    calc.totalPrice,

                stock:
                    newStock

            };

        } catch (error) {

            // -------------------------------------------------
            // UPDATE IMPORT FAILED
            //
            // Reverse NEW STOCK
            // -------------------------------------------------

            try {

                await StockService.reverseReceive(

                    product.code,

                    calc.qty,

                    {

                        movement_no:
                            `IMP-${id}-ROLLBACK-NEW`,

                        reference_type:
                            "IMPORT_EDIT_ROLLBACK",

                        reference_no:
                            values.invoice_no ||
                            "",

                        unit_cost:
                            calc.unitPrice,

                        total_cost:
                            calc.totalPrice,

                        remark:
                            `Rollback Import Edit #${id}`

                    }

                );

            } catch (rollbackError) {

                console.error(
                    `IMPORT EDIT NEW STOCK ROLLBACK ERROR #${id}:`,
                    rollbackError
                );

            }


            // -------------------------------------------------
            // RESTORE OLD STOCK
            // -------------------------------------------------

            try {

                await StockService.receive(

                    oldProductCode,

                    oldQty,

                    {

                        product_name:
                            old.product_name ||
                            "",

                        movement_no:
                            `IMP-${id}-RESTORE-OLD`,

                        reference_type:
                            "IMPORT_EDIT_ROLLBACK",

                        reference_no:
                            old.invoice_no ||
                            "",

                        unit_weight:
                            Number(
                                old.unit_weight ||
                                0
                            ),

                        total_weight:
                            Number(
                                old.weight ||
                                0
                            ),

                        unit_cost:
                            oldUnitCost,

                        total_cost:
                            oldTotalPrice,

                        remark:
                            `Restore Old Import #${id}`

                    }

                );

            } catch (restoreError) {

                console.error(
                    `IMPORT EDIT OLD STOCK RESTORE ERROR #${id}:`,
                    restoreError
                );

            }


            throw error;

        }

    }
        // =====================================================
    // DELETE IMPORT
    //
    // 1. อ่าน Import
    // 2. Reverse Stock
    // 3. Delete Import
    // 4. Delete Physical Files
    //
    // ถ้า Delete Import ไม่สำเร็จ
    // Restore Stock กลับ
    // =====================================================


    // =====================================================
    // DELETE ONE FILE
    //
    // DELETE /api/imports/:id/file/:field
    //
    // ลบเฉพาะไฟล์
    //
    // ไม่กระทบ:
    //
    // - Import ตัวอื่น
    // - Stock
    //
    // =====================================================

    async deleteFile(
        id,
        field
    ) {

        // -------------------------------------------------
        // NORMALIZE ID
        // -------------------------------------------------

        const importId =
            this.normalizeId(
                id
            );


        // -------------------------------------------------
        // ALLOWED FILE FIELDS
        // -------------------------------------------------

        const allowedFields = [

            "invoice_file",

            "acdd_file",

            "formd_file",

            "truck_file",

            "payment_file",

            "fda_file",

            "import_license_file"

        ];


        // -------------------------------------------------
        // VALIDATE FIELD
        // -------------------------------------------------

        if (
            !allowedFields.includes(
                field
            )
        ) {

            throw new Error(
                "Invalid import file field"
            );

        }


        // -------------------------------------------------
        // GET IMPORT
        // -------------------------------------------------

        const old =
            await this.getById(
                importId
            );


        if (!old) {

            throw new Error(
                "Import not found"
            );

        }


        // -------------------------------------------------
        // GET FILE NAME
        // -------------------------------------------------

        const fileName =
            String(
                old[field] ||
                ""
            ).trim();


        if (!fileName) {

            throw new Error(
                "File not found"
            );

        }


        // -------------------------------------------------
        // CLEAR FILE FROM DATABASE
        // -------------------------------------------------

        const result =
            await run(`

                UPDATE imports

                SET ${field} = ''

                WHERE id = ?

            `, [

                importId

            ]);


        if (

            !result

            ||

            result.changes === 0

        ) {

            throw new Error(
                "Failed to delete import file"
            );

        }


        // -------------------------------------------------
        // DELETE PHYSICAL FILE
        // -------------------------------------------------

        const filePath =
            path.join(

                __dirname,

                "../uploads",

                path.basename(
                    fileName
                )

            );


        try {

            await fs.promises.unlink(
                filePath
            );

        } catch (
            error
        ) {

            // -------------------------------------------------
            // FILE ALREADY DELETED
            //
            // ถือว่าสำเร็จ
            // -------------------------------------------------

            if (
                error.code !==
                "ENOENT"
            ) {

                console.error(

                    `IMPORT FILE DELETE ERROR #${importId} ${field}:`,

                    error

                );

            }

        }


        return {

            id:
                importId,

            field,

            file:
                fileName

        };

    }


    // =====================================================
    // DELETE ALL PHYSICAL FILES
    //
    // ใช้ตอน:
    //
    // DELETE IMPORT
    //
    // Database ถูกลบแล้ว
    // จากนั้นลบไฟล์จริงทั้งหมด
    //
    // =====================================================

    async deletePhysicalFiles(
        importData = {}
    ) {

        const fileFields = [

            "invoice_file",

            "acdd_file",

            "formd_file",

            "truck_file",

            "payment_file",

            "fda_file",

            "import_license_file"

        ];


        const errors = [];


        // -------------------------------------------------
        // LOOP FILES
        // -------------------------------------------------

        for (
            const field
            of fileFields
        ) {

            const fileName =
                String(
                    importData[field] ||
                    ""
                ).trim();


            if (
                !fileName
            ) {

                continue;

            }


            // -------------------------------------------------
            // SAFE FILE PATH
            // -------------------------------------------------

            const filePath =
                path.join(

                    __dirname,

                    "../uploads",

                    path.basename(
                        fileName
                    )

                );


            try {

                await fs.promises.unlink(
                    filePath
                );

            } catch (
                error
            ) {

                // -------------------------------------------------
                // FILE ALREADY GONE
                // -------------------------------------------------

                if (
                    error.code ===
                    "ENOENT"
                ) {

                    continue;

                }


                // -------------------------------------------------
                // OTHER ERROR
                // -------------------------------------------------

                console.error(

                    `IMPORT FILE DELETE ERROR ${field}:`,

                    error

                );


                errors.push({

                    field,

                    file:
                        fileName,

                    message:
                        error.message

                });

            }

        }


        return errors;

    }


    // =====================================================
    // DELETE IMPORT
    //
    // 1. GET IMPORT
    // 2. VALIDATE QUANTITY
    // 3. VALIDATE PRICE
    // 4. VALIDATE PRODUCT
    // 5. REVERSE STOCK
    // 6. DELETE IMPORT
    // 7. DELETE PHYSICAL FILES
    //
    // ถ้า DELETE IMPORT ไม่สำเร็จ:
    //
    // Reverse Stock
    //      ↓
    // Restore Stock
    //
    // =====================================================

    async delete(
        id
    ) {

        // -------------------------------------------------
        // GET IMPORT
        // -------------------------------------------------

        const old =
            await this.getById(
                id
            );


        if (!old) {

            throw new Error(
                "Import not found"
            );

        }


        // -------------------------------------------------
        // QUANTITY
        // -------------------------------------------------

        const qty =
            Number(
                old.qty ||
                0
            );


        if (

            !Number.isFinite(
                qty
            )

            ||

            qty <= 0

        ) {

            throw new Error(
                "Import quantity is invalid"
            );

        }


        // -------------------------------------------------
        // PRICE
        // -------------------------------------------------

        const totalPrice =
            Number(
                old.total_price ||
                0
            );


        if (

            !Number.isFinite(
                totalPrice
            )

            ||

            totalPrice < 0

        ) {

            throw new Error(
                "Import total price is invalid"
            );

        }


        // -------------------------------------------------
        // UNIT COST
        // -------------------------------------------------

        const unitCost =

            qty > 0

                ? (

                    totalPrice /
                    qty

                )

                : 0;


        // -------------------------------------------------
        // PRODUCT
        // -------------------------------------------------

        const productCode =
            String(

                old.product_code ||

                ""

            ).trim();


        if (

            !/^\d+$/.test(
                productCode
            )

        ) {

            throw new Error(
                "Product number is invalid"
            );

        }


        // -------------------------------------------------
        // REVERSE STOCK
        // -------------------------------------------------

        await StockService.reverseReceive(

            productCode,

            qty,

            {

                movement_no:
                    `IMP-${id}-DELETE`,

                reference_type:
                    "IMPORT_DELETE",

                reference_no:
                    old.invoice_no ||
                    "",

                unit_cost:
                    unitCost,

                total_cost:
                    totalPrice,

                remark:
                    `Delete Import #${id}`

            }

        );


        // -------------------------------------------------
        // DELETE IMPORT
        // -------------------------------------------------

        try {

            const result =
                await run(`

                    DELETE FROM imports

                    WHERE id = ?

                `, [

                    id

                ]);


            if (

                !result

                ||

                result.changes === 0

            ) {

                throw new Error(
                    "Failed to delete import"
                );

            }


            // -------------------------------------------------
            // DELETE PHYSICAL FILES
            // -------------------------------------------------

            const fileDeleteErrors =
                await this.deletePhysicalFiles(
                    old
                );


            return {

                ...result,

                id,

                fileDeleteErrors

            };

        } catch (
            error
        ) {

            // -------------------------------------------------
            // DELETE FAILED
            //
            // RESTORE STOCK
            // -------------------------------------------------

            try {

                await StockService.receive(

                    productCode,

                    qty,

                    {

                        product_name:
                            old.product_name ||
                            "",

                        movement_no:
                            `IMP-${id}-DELETE-ROLLBACK`,

                        reference_type:
                            "IMPORT_DELETE_ROLLBACK",

                        reference_no:
                            old.invoice_no ||
                            "",

                        unit_weight:
                            Number(
                                old.unit_weight ||
                                0
                            ),

                        total_weight:
                            Number(
                                old.weight ||
                                0
                            ),

                        unit_cost:
                            unitCost,

                        total_cost:
                            totalPrice,

                        remark:
                            `Restore Deleted Import #${id}`

                    }

                );

            } catch (
                restoreError
            ) {

                console.error(

                    `IMPORT DELETE RESTORE ERROR #${id}:`,

                    restoreError

                );

            }


            throw error;

        }

    }

}


// =========================================================
// EXPORT
// =========================================================

module.exports =
    new ImportService();