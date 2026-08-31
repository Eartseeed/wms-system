const {
    all,
    get,
    run
} = require("../config/database");

const StockService = require("./stockService");


// ======================================================
// EXPORT SERVICE
// ======================================================

class ExportService {


    // ======================================================
    // GET ALL
    // ======================================================

    async getAll() {

        return await all(`

            SELECT *

            FROM export_invoice

            ORDER BY id DESC

        `);

    }


    // ======================================================
    // GET BY ID
    // ======================================================

    async getById(id) {

        return await get(`

            SELECT *

            FROM export_invoice

            WHERE id = ?

            LIMIT 1

        `, [id]);

    }


    // ======================================================
    // GET BY INVOICE
    // ======================================================

    async findByInvoice(invoiceNo) {

        if (!invoiceNo) {
            return [];
        }

        return await all(`

            SELECT *

            FROM export_invoice

            WHERE invoice_no = ?

            ORDER BY id DESC

        `, [invoiceNo]);

    }


    // ======================================================
    // FIND PRODUCT
    // ======================================================

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

    if (product) {

        return product;

    }

    const productName =
        String(
            data.product_name ?? ""
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


    // ======================================================
    // GET STOCK
    // ======================================================

    async getStock(productId) {

        const stock =
            await StockService.getByProduct(
                productId
            );


        if (!stock) {

            throw new Error(
                "Stock not found"
            );

        }


        return stock;

    }


    // ======================================================
    // CALCULATE EXPORT DATA
    // ======================================================

    calculateExportData(
        data = {},
        product,
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
                "Export quantity must be greater than 0"
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
            data.weight ??
            data.total_weight;


        const totalWeight =
            suppliedWeight !== undefined &&
            suppliedWeight !== null &&
            suppliedWeight !== ""
                ? Number(suppliedWeight)
                : qty * unitWeight;


        if (
            !Number.isFinite(totalWeight) ||
            totalWeight <= 0
        ) {

            throw new Error(
                "Total weight must be greater than 0"
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


    // ======================================================
    // BUILD EXPORT VALUES
    // ======================================================

    buildExportValues(
        data = {},
        product,
        calculated,
        old = null
    ) {

        return {

            invoice_no:
                data.invoice_no ??
                old?.invoice_no ??
                "",


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


            unit_price:
                calculated.unitPrice,


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


            payment_file:
                data.payment_file ??
                old?.payment_file ??
                "",


            formd_file:
                data.formd_file ??
                old?.formd_file ??
                "",


            phytos_file:
                data.phytos_file ??
                old?.phytos_file ??
                "",


            tax_file:
                data.tax_file ??
                old?.tax_file ??
                "",


            export_license_file:
                data.export_license_file ??
                old?.export_license_file ??
                "",


            origin_file:
                data.origin_file ??
                old?.origin_file ??
                "",


            acdd_file:
                data.acdd_file ??
                old?.acdd_file ??
                ""

        };

    }


    // ======================================================
    // BUILD STOCK OPTIONS
    // ======================================================

    buildStockOptions(
        data = {},
        calculated,
        invoiceNo = "",
        movementNo = "",
        referenceType = "EXPORT"
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


            remark:
                data.remark ??
                `Export Invoice ${invoiceNo || ""}`,


            created_by:
                data.created_by ??
                ""

        };

    }


    // ======================================================
    // VALIDATE
    // ======================================================

    validate(data) {

        if (!data.invoice_no) {

            throw new Error(
                "Invoice No is required"
            );

        }


        if (!data.product_code) {

            throw new Error(
                "Product Code is required"
            );

        }


        if (!data.product_name) {

            throw new Error(
                "Product Name is required"
            );

        }


        if (
            !Number.isFinite(data.qty) ||
            data.qty <= 0
        ) {

            throw new Error(
                "Qty must be greater than 0"
            );

        }


        if (
            !Number.isFinite(data.unit_weight) ||
            data.unit_weight < 0
        ) {

            throw new Error(
                "Unit weight is invalid"
            );

        }


        if (
            !Number.isFinite(data.weight) ||
            data.weight <= 0
        ) {

            throw new Error(
                "Weight must be greater than 0"
            );

        }


        if (
            !Number.isFinite(data.unit_price) ||
            data.unit_price < 0
        ) {

            throw new Error(
                "Unit price is invalid"
            );

        }


        if (
            !Number.isFinite(data.total_price) ||
            data.total_price < 0
        ) {

            throw new Error(
                "Total price is invalid"
            );

        }


        if (!data.invoice_date) {

            throw new Error(
                "Invoice Date is required"
            );

        }

    }


    // ======================================================
    // CHECK STOCK BEFORE EXPORT
    // ======================================================

    async validateStock(
        productId,
        qty
    ) {

        const stock =
            await this.getStock(
                productId
            );


        const availableQty =
            Number(
                stock.available_qty ??
                0
            );


        if (
            availableQty < qty
        ) {

            throw new Error(

                `Stock not enough. Available: ${availableQty}, Requested: ${qty}`

            );

        }


        return stock;

    }


    // ======================================================
    // CREATE EXPORT
    //
    // export_invoice
    //      ↓
    // StockService.issue()
    //      ↓
    // stock
    //      ↓
    // stock_movements
    //
    // ======================================================

    async create(data = {}) {

        // --------------------------------------------------
        // FIND PRODUCT
        // --------------------------------------------------

        const product =
            await this.findProduct(
                data.product_code
            );


        // --------------------------------------------------
        // CALCULATE
        // --------------------------------------------------

        const calculated =
            this.calculateExportData(
                data,
                product
            );


        // --------------------------------------------------
        // BUILD DATA
        // --------------------------------------------------

        const values =
            this.buildExportValues(
                data,
                product,
                calculated
            );


        // --------------------------------------------------
        // VALIDATE
        // --------------------------------------------------

        this.validate(values);


        // --------------------------------------------------
        // DUPLICATE CHECK
        // --------------------------------------------------

        const duplicate =
            await get(`

                SELECT id

                FROM export_invoice

                WHERE invoice_no = ?

                AND product_code = ?

                LIMIT 1

            `, [

                values.invoice_no,

                values.product_code

            ]);


        if (duplicate) {

            throw new Error(
                "Export invoice already exists"
            );

        }


        // --------------------------------------------------
        // CHECK STOCK
        // --------------------------------------------------

        await this.validateStock(

            product.id,

            calculated.qty

        );


        // --------------------------------------------------
        // INSERT EXPORT
        // --------------------------------------------------

        let exportResult;

        try {

            exportResult =
                await run(`

                    INSERT INTO export_invoice (

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

                        payment_file,

                        formd_file,

                        phytos_file,

                        tax_file,

                        export_license_file,

                        origin_file,

                        acdd_file

                    )

                    VALUES (

                        ?,?,?,?,?,?,?,?,?,?,

                        ?,?,?,?,?,?,?,?,?

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

                    values.payment_file,

                    values.formd_file,

                    values.phytos_file,

                    values.tax_file,

                    values.export_license_file,

                    values.origin_file,

                    values.acdd_file

                ]);


            if (!exportResult?.id) {

                throw new Error(
                    "Failed to create export"
                );

            }

        } catch (err) {

            throw err;

        }


        // --------------------------------------------------
        // ISSUE STOCK
        // --------------------------------------------------

        let stock;

        try {

            stock =
                await StockService.issue(

                    product.id,

                    calculated.qty,

                    this.buildStockOptions(

                        data,

                        calculated,

                        values.invoice_no,

                        `EXP-${exportResult.id}`,

                        "EXPORT"

                    )

                );

        } catch (err) {

            // ------------------------------------------------
            // ROLLBACK EXPORT
            // ------------------------------------------------

            try {

                await run(`

                    DELETE FROM export_invoice

                    WHERE id = ?

                `, [
                    exportResult.id
                ]);

            } catch (rollbackErr) {

                console.error(
                    "Export create rollback error:",
                    rollbackErr
                );

            }

            throw err;

        }


        return {

            id:
                exportResult.id,

            changes:
                exportResult.changes,

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


    // ======================================================
    // UPDATE EXPORT
    //
    // OLD STOCK
    //      ↓
    // reverse issue
    //      ↓
    // NEW STOCK
    //      ↓
    // issue
    //      ↓
    // UPDATE EXPORT
    //
    // ======================================================

    async update(
        id,
        data = {}
    ) {

        // --------------------------------------------------
        // GET OLD EXPORT
        // --------------------------------------------------

        const old =
            await this.getById(id);


        if (!old) {

            throw new Error(
                "Export invoice not found"
            );

        }


        // --------------------------------------------------
        // OLD PRODUCT
        // --------------------------------------------------

        const oldProduct =
            await this.findProduct(
                old.product_code
            );


        // --------------------------------------------------
        // NEW PRODUCT
        // --------------------------------------------------

        const newProductCode =
            data.product_code ??
            old.product_code;


        const newProduct =
            await this.findProduct(
                newProductCode
            );


        // --------------------------------------------------
        // CALCULATE NEW
        // --------------------------------------------------

        const calculated =
            this.calculateExportData(
                data,
                newProduct,
                old
            );


        // --------------------------------------------------
        // BUILD VALUES
        // --------------------------------------------------

        const values =
            this.buildExportValues(
                data,
                newProduct,
                calculated,
                old
            );


        // --------------------------------------------------
        // VALIDATE
        // --------------------------------------------------

        this.validate(values);


        // --------------------------------------------------
        // DUPLICATE CHECK
        // --------------------------------------------------

        const duplicate =
            await get(`

                SELECT id

                FROM export_invoice

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
                "Export invoice already exists"
            );

        }


        // --------------------------------------------------
        // OLD QTY
        // --------------------------------------------------

        const oldQty =
            Number(
                old.qty || 0
            );


        if (
            !Number.isFinite(oldQty) ||
            oldQty <= 0
        ) {

            throw new Error(
                "Old export quantity is invalid"
            );

        }


        // --------------------------------------------------
        // STEP 1
        // RETURN OLD STOCK
        //
        // ISSUE เดิมถูกตัดออกไป
        // ดังนั้นตอนแก้ต้องคืนกลับ
        //
        // ใช้ receive()
        // --------------------------------------------------

        await StockService.receive(

            oldProduct.id,

            oldQty,

            {

                movement_no:
                    `EXP-${id}-REVERSE`,

                reference_type:
                    "EXPORT_EDIT",

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
                    `Reverse Export Edit #${id}`,

                created_by:
                    data.created_by ??
                    ""

            }

        );


        // --------------------------------------------------
        // STEP 2
        // CHECK NEW STOCK
        // --------------------------------------------------

        try {

            await this.validateStock(

                newProduct.id,

                calculated.qty

            );

        } catch (err) {

            // ----------------------------------------------
            // RESTORE STATE
            // ----------------------------------------------

            try {

                await StockService.issue(

                    oldProduct.id,

                    oldQty,

                    {

                        movement_no:
                            `EXP-${id}-RESTORE-OLD`,

                        reference_type:
                            "EXPORT_EDIT_ROLLBACK",

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

                        remark:
                            `Restore Old Export #${id}`,

                        created_by:
                            data.created_by ??
                            ""

                    }

                );

            } catch (restoreErr) {

                console.error(
                    "Export update stock restore error:",
                    restoreErr
                );

            }

            throw err;

        }


        // --------------------------------------------------
        // STEP 3
        // ISSUE NEW STOCK
        // --------------------------------------------------

        let newStock;

        try {

            newStock =
                await StockService.issue(

                    newProduct.id,

                    calculated.qty,

                    this.buildStockOptions(

                        {
                            ...old,
                            ...data
                        },

                        calculated,

                        values.invoice_no,

                        `EXP-${id}-EDIT`,

                        "EXPORT_EDIT"

                    )

                );

        } catch (err) {

            // ----------------------------------------------
            // RESTORE OLD STOCK
            // ----------------------------------------------

            try {

                await StockService.issue(

                    oldProduct.id,

                    oldQty,

                    {

                        movement_no:
                            `EXP-${id}-RESTORE-OLD`,

                        reference_type:
                            "EXPORT_EDIT_ROLLBACK",

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

                        remark:
                            `Restore Old Export #${id}`,

                        created_by:
                            data.created_by ??
                            ""

                    }

                );

            } catch (restoreErr) {

                console.error(
                    "Export update restore error:",
                    restoreErr
                );

            }

            throw err;

        }


        // --------------------------------------------------
        // STEP 4
        // UPDATE EXPORT
        // --------------------------------------------------

        try {

            const result =
                await run(`

                    UPDATE export_invoice

                    SET

                        invoice_no = ?,

                        product_code = ?,

                        product_name = ?,

                        qty = ?,

                        unit = ?,

                        unit_weight = ?,

                        weight = ?,

                        unit_price = ?,

                        total_price = ?,

                        supplier = ?,

                        invoice_date = ?,

                        invoice_file = ?,

                        payment_file = ?,

                        formd_file = ?,

                        phytos_file = ?,

                        tax_file = ?,

                        export_license_file = ?,

                        origin_file = ?,

                        acdd_file = ?,

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

                    values.unit_price,

                    values.total_price,

                    values.supplier,

                    values.invoice_date,

                    values.invoice_file,

                    values.payment_file,

                    values.formd_file,

                    values.phytos_file,

                    values.tax_file,

                    values.export_license_file,

                    values.origin_file,

                    values.acdd_file,

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

            // ------------------------------------------------
            // UPDATE FAILED
            //
            // 1. คืน NEW STOCK
            // 2. คืน OLD STOCK กลับสู่สถานะเดิม
            // ------------------------------------------------

            try {

                await StockService.receive(

                    newProduct.id,

                    calculated.qty,

                    {

                        movement_no:
                            `EXP-${id}-UPDATE-ROLLBACK-NEW`,

                        reference_type:
                            "EXPORT_EDIT_ROLLBACK",

                        reference_no:
                            values.invoice_no || "",

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

                        remark:
                            `Restore New Export Stock #${id}`,

                        created_by:
                            data.created_by ??
                            ""

                    }

                );


                await StockService.issue(

                    oldProduct.id,

                    oldQty,

                    {

                        movement_no:
                            `EXP-${id}-UPDATE-ROLLBACK-OLD`,

                        reference_type:
                            "EXPORT_EDIT_ROLLBACK",

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

                        remark:
                            `Restore Old Export #${id}`,

                        created_by:
                            data.created_by ??
                            ""

                    }

                );

            } catch (rollbackErr) {

                console.error(
                    "Export update rollback error:",
                    rollbackErr
                );

            }

            throw err;

        }

    }


    // ======================================================
    // DELETE EXPORT
    //
    // Export ถูกลบ
    //      ↓
    // คืน Stock
    //      ↓
    // ลบ export_invoice
    //
    // ======================================================

    async delete(id) {

        // --------------------------------------------------
        // GET OLD EXPORT
        // --------------------------------------------------

        const old =
            await this.getById(id);


        if (!old) {

            throw new Error(
                "Export invoice not found"
            );

        }


        // --------------------------------------------------
        // FIND PRODUCT
        // --------------------------------------------------

        const product =
            await this.findProduct(
                old.product_code
            );


        // --------------------------------------------------
        // OLD QTY
        // --------------------------------------------------

        const qty =
            Number(
                old.qty || 0
            );


        if (
            !Number.isFinite(qty) ||
            qty <= 0
        ) {

            throw new Error(
                "Export quantity is invalid"
            );

        }


        // --------------------------------------------------
        // STEP 1
        // RETURN STOCK
        // --------------------------------------------------

        await StockService.receive(

            product.id,

            qty,

            {

                movement_no:
                    `EXP-${id}-DELETE`,

                reference_type:
                    "EXPORT_DELETE",

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
                    `Delete Export #${id}`,

                created_by:
                    ""

            }

        );


        // --------------------------------------------------
        // STEP 2
        // DELETE EXPORT
        // --------------------------------------------------

        try {

            const result =
                await run(`

                    DELETE FROM export_invoice

                    WHERE id = ?

                `, [id]);


            return {

                ...result,

                id

            };

        } catch (err) {

            // ------------------------------------------------
            // DELETE FAILED
            // ต้องตัด Stock กลับออก
            // เพื่อให้ Stock กลับไปเหมือนก่อน Delete
            // ------------------------------------------------

            try {

                await StockService.issue(

                    product.id,

                    qty,

                    {

                        movement_no:
                            `EXP-${id}-DELETE-ROLLBACK`,

                        reference_type:
                            "EXPORT_DELETE_ROLLBACK",

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

                        remark:
                            `Rollback Delete Export #${id}`,

                        created_by:
                            ""

                    }

                );

            } catch (rollbackErr) {

                console.error(
                    "Export delete rollback error:",
                    rollbackErr
                );

            }

            throw err;

        }

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports =
    new ExportService();