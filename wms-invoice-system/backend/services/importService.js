const {
    all,
    get,
    run
} = require("../config/database");

const StockService =
    require("./stockService");


// =========================================================
// IMPORT SERVICE
// =========================================================

class ImportService {


    // =========================================================
    // GET ALL
    // =========================================================

    async getAll() {

        return await all(`

            SELECT *

            FROM imports

            ORDER BY id DESC

        `);

    }


    // =========================================================
    // GET BY ID
    // =========================================================

    async getById(id) {

        return await get(`

            SELECT *

            FROM imports

            WHERE id = ?

            LIMIT 1

        `, [id]);

    }


    // =========================================================
    // GET BY INVOICE
    // =========================================================

    async findByInvoice(invoiceNo) {

        const value =
            String(
                invoiceNo ?? ""
            ).trim();


        if (!value) {

            return null;

        }


        return await get(`

            SELECT *

            FROM imports

            WHERE invoice_no = ?

            ORDER BY id DESC

            LIMIT 1

        `, [value]);

    }


    // =========================================================
    // FIND OR CREATE PRODUCT
    //
    // Product Code สามารถกรอกใหม่ได้
    // ไม่ต้องมี Product Master อยู่ก่อน
    // =========================================================

    async findOrCreateProduct(data = {}) {

        const code =
            String(
                data.product_code ?? ""
            ).trim();


        if (!code) {

            throw new Error(
                "Product code is required"
            );

        }


        let product =
            await get(`

                SELECT

                    id,

                    code,

                    name,

                    weight

                FROM products

                WHERE code = ?

                LIMIT 1

            `, [code]);


        // -----------------------------------------------------
        // PRODUCT EXISTS
        // -----------------------------------------------------

        if (product) {

            return product;

        }


        // -----------------------------------------------------
        // PRODUCT DOES NOT EXIST
        // สร้างจากข้อมูล Import
        // -----------------------------------------------------

        const productName =
            String(
                data.product_name ??
                ""
            ).trim();


        if (!productName) {

            throw new Error(
                "Product name is required for new product"
            );

        }


        const weight =
            Number(
                data.unit_weight ??
                data.weight ??
                0
            );


        if (
            !Number.isFinite(weight) ||
            weight < 0
        ) {

            throw new Error(
                "Product weight is invalid"
            );

        }


        const result =
            await run(`

                INSERT INTO products (

                    code,

                    name,

                    weight,

                    is_active,

                    status,

                    created_at,

                    updated_at

                )

                VALUES (

                    ?,

                    ?,

                    ?,

                    1,

                    1,

                    CURRENT_TIMESTAMP,

                    CURRENT_TIMESTAMP

                )

            `, [

                code,

                productName,

                weight

            ]);


        if (!result?.id) {

            throw new Error(
                "Failed to create product"
            );

        }


        product =
            await get(`

                SELECT

                    id,

                    code,

                    name,

                    weight

                FROM products

                WHERE id = ?

                LIMIT 1

            `, [

                result.id

            ]);


        if (!product) {

            throw new Error(
                "Failed to load created product"
            );

        }


        return product;

    }


    // =========================================================
    // CALCULATE IMPORT
    // =========================================================

    calculateImportData(
        data = {},
        product = null,
        old = null
    ) {

        const qty =
            Number(

                data.qty ??
                data.quantity ??
                old?.qty ??
                0

            );


        if (
            !Number.isFinite(qty) ||
            qty <= 0
        ) {

            throw new Error(
                "Import quantity must be greater than 0"
            );

        }


        const unitWeight =
            Number(

                data.unit_weight ??
                old?.unit_weight ??
                product?.weight ??
                0

            );


        if (
            !Number.isFinite(unitWeight) ||
            unitWeight < 0
        ) {

            throw new Error(
                "Unit weight is invalid"
            );

        }


        const suppliedWeight =
            data.total_weight ??
            data.weight;


        const totalWeight =
            suppliedWeight !== undefined &&
            suppliedWeight !== null &&
            suppliedWeight !== ""
                ? Number(suppliedWeight)
                : qty * unitWeight;


        if (
            !Number.isFinite(totalWeight) ||
            totalWeight < 0
        ) {

            throw new Error(
                "Total weight is invalid"
            );

        }


        const totalPrice =
            Number(

                data.total_price ??
                old?.total_price ??
                0

            );


        if (
            !Number.isFinite(totalPrice) ||
            totalPrice < 0
        ) {

            throw new Error(
                "Total price is invalid"
            );

        }


        const unitPrice =
            qty > 0
                ? totalPrice / qty
                : 0;


        return {

            qty,

            unitWeight,

            totalWeight,

            totalPrice,

            unitPrice

        };

    }


    // =========================================================
    // BUILD IMPORT VALUES
    // =========================================================

    buildImportValues(
        data = {},
        product,
        calculated,
        old = null
    ) {

        return {

            invoice_no:
                String(

                    data.invoice_no ??
                    old?.invoice_no ??
                    ""

                ).trim(),


            product_code:
                product.code,


            product_name:
                data.product_name ??
                old?.product_name ??
                product.name ??
                "",


            qty:
                calculated.qty,


            unit:
                data.unit ??
                old?.unit ??
                "",


            unit_weight:
                calculated.unitWeight,


            weight:
                calculated.totalWeight,


            total_price:
                calculated.totalPrice,


            supplier:
                data.supplier ??
                old?.supplier ??
                "",


            invoice_date:
                data.invoice_date ??
                old?.invoice_date ??
                null,


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


    // =========================================================
    // BUILD STOCK OPTIONS
    // =========================================================

    buildStockOptions(
        data = {},
        calculated,
        invoiceNo = "",
        movementNo = "",
        referenceType = "IMPORT"
    ) {

        return {

            movement_no:
                movementNo,

            reference_type:
                referenceType,

            reference_no:
                invoiceNo || "",

            unit_weight:
                calculated.unitWeight,

            total_weight:
                calculated.totalWeight,

            unit_cost:
                calculated.qty > 0
                    ? calculated.totalPrice /
                      calculated.qty
                    : 0,

            total_cost:
                calculated.totalPrice,

            warehouse_id:
                data.warehouse_id ??
                null,

            location:
                data.location ??
                "",

            rack:
                data.rack ??
                "",

            shelf:
                data.shelf ??
                "",

            bin:
                data.bin ??
                "",

            lot_no:
                data.lot_no ??
                "",

            batch_no:
                data.batch_no ??
                "",

            serial_no:
                data.serial_no ??
                "",

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

            remark:
                data.remark ??
                `Import Invoice ${invoiceNo || ""}`,

            created_by:
                data.created_by ??
                ""

        };

    }


    // =========================================================
    // CREATE IMPORT
    // =========================================================

    async create(data = {}) {

        // -----------------------------------------------------
        // 1. PRODUCT CODE
        // -----------------------------------------------------

        const product =
            await this.findOrCreateProduct(
                data
            );


        // -----------------------------------------------------
        // 2. CALCULATE
        // -----------------------------------------------------

        const calculated =
            this.calculateImportData(
                data,
                product
            );


        // -----------------------------------------------------
        // 3. BUILD VALUES
        // -----------------------------------------------------

        const values =
            this.buildImportValues(
                data,
                product,
                calculated
            );


        // -----------------------------------------------------
        // 4. REQUIRED
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // 5. DUPLICATE
        // -----------------------------------------------------

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


        // -----------------------------------------------------
        // 6. INSERT IMPORT
        // -----------------------------------------------------

        const importResult =
            await run(`

                INSERT INTO imports (

                    invoice_no,

                    product_code,

                    product_name,

                    qty,

                    unit,

                    unit_weight,

                    weight,

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

                    ?,?,?,?,?,?,?,?,

                    ?,?,

                    ?,?,?,?,?,?,?

                )

            `, [

                values.invoice_no,

                values.product_code,

                values.product_name,

                values.qty,

                values.unit,

                values.unit_weight,

                values.weight,

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


        if (!importResult?.id) {

            throw new Error(
                "Failed to create import"
            );

        }


        // -----------------------------------------------------
        // 7. IMPORT → STOCK
        // -----------------------------------------------------

        let stock;


        try {

            stock =
                await StockService.receive(

                    product.id,

                    calculated.qty,

                    this.buildStockOptions(

                        data,

                        calculated,

                        values.invoice_no,

                        `IMP-${importResult.id}`,

                        "IMPORT"

                    )

                );

        } catch (err) {

            try {

                await run(`

                    DELETE FROM imports

                    WHERE id = ?

                `, [

                    importResult.id

                ]);

            } catch (rollbackError) {

                console.error(
                    "Import rollback failed:",
                    rollbackError
                );

            }

            throw err;

        }


        // -----------------------------------------------------
        // 8. RETURN
        // -----------------------------------------------------

        return {

            id:
                importResult.id,

            changes:
                importResult.changes,

            product_id:
                product.id,

            product_code:
                product.code,

            product_name:
                values.product_name,

            invoice_no:
                values.invoice_no,

            qty:
                calculated.qty,

            unit:
                values.unit,

            unit_weight:
                calculated.unitWeight,

            total_weight:
                calculated.totalWeight,

            unit_price:
                calculated.unitPrice,

            total_price:
                calculated.totalPrice,

            stock

        };

    }


    // =========================================================
    // UPDATE IMPORT
    // =========================================================

    async update(
        id,
        data = {}
    ) {

        const old =
            await this.getById(id);


        if (!old) {

            throw new Error(
                "Import not found"
            );

        }


        const oldProduct =
            await this.findOrCreateProduct({

                product_code:
                    old.product_code,

                product_name:
                    old.product_name,

                unit_weight:
                    old.unit_weight

            });


        const newProduct =
            await this.findOrCreateProduct({

                ...old,

                ...data

            });


        const calculated =
            this.calculateImportData(

                data,

                newProduct,

                old

            );


        const oldQty =
            Number(
                old.qty || 0
            );


        if (
            !Number.isFinite(oldQty) ||
            oldQty <= 0
        ) {

            throw new Error(
                "Old import quantity is invalid"
            );

        }


        const values =
            this.buildImportValues(

                data,

                newProduct,

                calculated,

                old

            );


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


        // -----------------------------------------------------
        // REVERSE OLD STOCK
        // -----------------------------------------------------

        await StockService.reverseReceive(

            oldProduct.id,

            oldQty,

            {

                movement_no:
                    `IMP-${id}-REVERSE`,

                reference_type:
                    "IMPORT_EDIT",

                reference_no:
                    old.invoice_no || "",

                unit_cost:
                    oldQty > 0
                        ? Number(
                            old.total_price || 0
                        ) / oldQty
                        : 0,

                total_cost:
                    Number(
                        old.total_price || 0
                    ),

                warehouse_id:
                    old.warehouse_id ??
                    null,

                location:
                    old.location ??
                    "",

                rack:
                    old.rack ??
                    "",

                shelf:
                    old.shelf ??
                    "",

                bin:
                    old.bin ??
                    "",

                lot_no:
                    old.lot_no ??
                    "",

                batch_no:
                    old.batch_no ??
                    "",

                serial_no:
                    old.serial_no ??
                    "",

                remark:
                    `Reverse Import Edit #${id}`

            }

        );


        let newStock;


        try {

            // -------------------------------------------------
            // RECEIVE NEW STOCK
            // -------------------------------------------------

            newStock =
                await StockService.receive(

                    newProduct.id,

                    calculated.qty,

                    this.buildStockOptions(

                        {
                            ...old,
                            ...data
                        },

                        calculated,

                        values.invoice_no,

                        `IMP-${id}-EDIT`,

                        "IMPORT_EDIT"

                    )

                );


            // -------------------------------------------------
            // UPDATE IMPORT
            // -------------------------------------------------

            const result =
                await run(`

                    UPDATE imports

                    SET

                        invoice_no = ?,

                        product_code = ?,

                        product_name = ?,

                        qty = ?,

                        unit = ?,

                        unit_weight = ?,

                        weight = ?,

                        total_price = ?,

                        supplier = ?,

                        invoice_date = ?,

                        invoice_file = ?,

                        acdd_file = ?,

                        formd_file = ?,

                        truck_file = ?,

                        payment_file = ?,

                        fda_file = ?,

                        import_license_file = ?,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = ?

                `, [

                    values.invoice_no,

                    values.product_code,

                    values.product_name,

                    values.qty,

                    values.unit,

                    values.unit_weight,

                    values.weight,

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


            return {

                ...result,

                id,

                product_id:
                    newProduct.id,

                product_code:
                    newProduct.code,

                product_name:
                    values.product_name,

                invoice_no:
                    values.invoice_no,

                qty:
                    calculated.qty,

                unit:
                    values.unit,

                unit_weight:
                    calculated.unitWeight,

                total_weight:
                    calculated.totalWeight,

                unit_price:
                    calculated.unitPrice,

                total_price:
                    calculated.totalPrice,

                stock:
                    newStock

            };

        } catch (err) {

            // -------------------------------------------------
            // ROLLBACK NEW STOCK
            // -------------------------------------------------

            try {

                await StockService.reverseReceive(

                    newProduct.id,

                    calculated.qty,

                    {

                        movement_no:
                            `IMP-${id}-ROLLBACK`,

                        reference_type:
                            "IMPORT_EDIT_ROLLBACK",

                        reference_no:
                            values.invoice_no || "",

                        unit_cost:
                            calculated.qty > 0
                                ? calculated.totalPrice /
                                  calculated.qty
                                : 0,

                        total_cost:
                            calculated.totalPrice,

                        remark:
                            `Rollback Import Edit #${id}`

                    }

                );

            } catch (rollbackError) {

                console.error(
                    "Rollback new stock failed:",
                    rollbackError
                );

            }


            // -------------------------------------------------
            // RESTORE OLD STOCK
            // -------------------------------------------------

            try {

                await StockService.receive(

                    oldProduct.id,

                    oldQty,

                    {

                        movement_no:
                            `IMP-${id}-RESTORE`,

                        reference_type:
                            "IMPORT_EDIT_ROLLBACK",

                        reference_no:
                            old.invoice_no || "",

                        unit_weight:
                            Number(
                                old.unit_weight || 0
                            ),

                        total_weight:
                            Number(
                                old.weight || 0
                            ),

                        unit_cost:
                            oldQty > 0
                                ? Number(
                                    old.total_price || 0
                                ) / oldQty
                                : 0,

                        total_cost:
                            Number(
                                old.total_price || 0
                            ),

                        warehouse_id:
                            old.warehouse_id ??
                            null,

                        location:
                            old.location ??
                            "",

                        rack:
                            old.rack ??
                            "",

                        shelf:
                            old.shelf ??
                            "",

                        bin:
                            old.bin ??
                            "",

                        lot_no:
                            old.lot_no ??
                            "",

                        batch_no:
                            old.batch_no ??
                            "",

                        serial_no:
                            old.serial_no ??
                            "",

                        remark:
                            `Restore Import #${id}`

                    }

                );

            } catch (restoreError) {

                console.error(
                    "Restore old stock failed:",
                    restoreError
                );

            }


            throw err;

        }

    }


    // =========================================================
    // DELETE IMPORT
    // =========================================================

    async delete(id) {

        const old =
            await this.getById(id);


        if (!old) {

            throw new Error(
                "Import not found"
            );

        }


        const product =
            await this.findOrCreateProduct({

                product_code:
                    old.product_code,

                product_name:
                    old.product_name,

                unit_weight:
                    old.unit_weight

            });


        const qty =
            Number(
                old.qty || 0
            );


        if (
            !Number.isFinite(qty) ||
            qty <= 0
        ) {

            throw new Error(
                "Import quantity is invalid"
            );

        }


        // -----------------------------------------------------
        // REVERSE STOCK
        // -----------------------------------------------------

        await StockService.reverseReceive(

            product.id,

            qty,

            {

                movement_no:
                    `IMP-${id}-DELETE`,

                reference_type:
                    "IMPORT_DELETE",

                reference_no:
                    old.invoice_no || "",

                unit_cost:
                    qty > 0
                        ? Number(
                            old.total_price || 0
                        ) / qty
                        : 0,

                total_cost:
                    Number(
                        old.total_price || 0
                    ),

                warehouse_id:
                    old.warehouse_id ??
                    null,

                location:
                    old.location ??
                    "",

                rack:
                    old.rack ??
                    "",

                shelf:
                    old.shelf ??
                    "",

                bin:
                    old.bin ??
                    "",

                lot_no:
                    old.lot_no ??
                    "",

                batch_no:
                    old.batch_no ??
                    "",

                serial_no:
                    old.serial_no ??
                    "",

                remark:
                    `Delete Import #${id}`

            }

        );


        try {

            const result =
                await run(`

                    DELETE FROM imports

                    WHERE id = ?

                `, [id]);


            if (
                !result ||
                result.changes === 0
            ) {

                throw new Error(
                    "Failed to delete import"
                );

            }


            return {

                ...result,

                id

            };

        } catch (err) {

            // -------------------------------------------------
            // RESTORE STOCK
            // -------------------------------------------------

            try {

                await StockService.receive(

                    product.id,

                    qty,

                    {

                        movement_no:
                            `IMP-${id}-DELETE-ROLLBACK`,

                        reference_type:
                            "IMPORT_DELETE_ROLLBACK",

                        reference_no:
                            old.invoice_no || "",

                        unit_weight:
                            Number(
                                old.unit_weight || 0
                            ),

                        total_weight:
                            Number(
                                old.weight || 0
                            ),

                        unit_cost:
                            qty > 0
                                ? Number(
                                    old.total_price || 0
                                ) / qty
                                : 0,

                        total_cost:
                            Number(
                                old.total_price || 0
                            ),

                        warehouse_id:
                            old.warehouse_id ??
                            null,

                        location:
                            old.location ??
                            "",

                        rack:
                            old.rack ??
                            "",

                        shelf:
                            old.shelf ??
                            "",

                        bin:
                            old.bin ??
                            "",

                        lot_no:
                            old.lot_no ??
                            "",

                        batch_no:
                            old.batch_no ??
                            "",

                        serial_no:
                            old.serial_no ??
                            "",

                        remark:
                            `Restore Deleted Import #${id}`

                    }

                );

            } catch (rollbackError) {

                console.error(
                    "Import delete rollback failed:",
                    rollbackError
                );

            }


            throw err;

        }

    }

}


// =========================================================
// EXPORT SERVICE INSTANCE
// =========================================================

module.exports =
    new ImportService();