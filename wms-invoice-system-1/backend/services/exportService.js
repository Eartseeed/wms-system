const {
    all,
    get,
    run,
    transaction
} = require("../config/database");

const StockService =
    require("./stockService");

const fs =
    require("fs");

const path =
    require("path");


// =========================================================
// EXPORT SERVICE
//
// Path:
// backend/services/exportService.js
//
// PROGRAM 2
//
// ไม่มี Product Master
//
// Product Number + Product Name
// เก็บตรงใน Export / Stock
// =========================================================
//
// FLOW
//
// CREATE EXPORT
// Export Invoice
//      ↓
// export_invoice
//      ↓
// StockService.issue()
//      ↓
// STOCK -
//
// EDIT EXPORT
// Export เดิม
//      ↓
// Reverse Stock เดิม
//      ↓
// Issue Stock ใหม่
//      ↓
// Update Export
//
// DELETE EXPORT
// Export
//      ↓
// Reverse Stock
//      ↓
// Delete Export
//
// IMPORTANT
//
// ห้าม UPDATE stock โดยตรงจาก ExportService
// ทุกการเปลี่ยน Stock ต้องผ่าน StockService
// =========================================================


class ExportService {


    // =====================================================
    // GET ALL EXPORT
    // =====================================================

    async getAll() {

        return await all(`
            SELECT *
            FROM export_invoice
            ORDER BY id DESC
        `);

    }


    // =====================================================
    // GET EXPORT BY ID
    // =====================================================

    async getById(
        id
    ) {

        const exportId =
            Number(
                id
            );


        if (
            !Number.isInteger(
                exportId
            ) ||
            exportId <= 0
        ) {

            throw new Error(
                "Export ID is invalid"
            );

        }


        return await get(`
            SELECT *
            FROM export_invoice
            WHERE id = ?
            LIMIT 1
        `, [

            exportId

        ]);

    }


    // =====================================================
    // FIND EXPORT BY INVOICE
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

            return [];

        }


        return await all(`
            SELECT *
            FROM export_invoice
            WHERE invoice_no = ?
            ORDER BY id DESC
        `, [

            value

        ]);

    }


    // =====================================================
    // NORMALIZE ID
    // =====================================================

    normalizeId(
        id
    ) {

        const exportId =
            Number(
                id
            );


        if (
            !Number.isInteger(
                exportId
            ) ||
            exportId <= 0
        ) {

            throw new Error(
                "Export ID is invalid"
            );

        }


        return exportId;

    }


    // =====================================================
    // BUILD PRODUCT
    //
    // PROGRAM 2 ไม่มี Product Master
    //
    // Product Number + Product Name
    // มาจาก Export โดยตรง
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


        if (
            !code
        ) {

            throw new Error(
                "Product number is required"
            );

        }


        // Product Number ต้องเป็นตัวเลขเท่านั้น

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
    // CALCULATE EXPORT
    //
    // Quantity
    // Unit Weight
    // Total Weight
    // Total Price
    // Unit Price
    // =====================================================

    calculate(
        data = {},
        old = null
    ) {

        // -------------------------------------------------
        // QUANTITY
        // -------------------------------------------------

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
            ) ||
            qty <= 0
        ) {

            throw new Error(
                "Export quantity must be greater than 0"
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
            ) ||
            unitWeight < 0
        ) {

            throw new Error(
                "Unit weight is invalid"
            );

        }


        // -------------------------------------------------
        // TOTAL WEIGHT
        //
        // ถ้ามี weight / total_weight
        // ใช้ค่าที่ส่งมา
        //
        // ถ้าไม่มี
        // qty × unit_weight
        // -------------------------------------------------

        const suppliedWeight =

            data.weight ??

            data.total_weight ??

            old?.weight;


        const totalWeight =

            suppliedWeight !==
                undefined &&

            suppliedWeight !==
                null &&

            suppliedWeight !==
                ""

                ? Number(
                    suppliedWeight
                )

                : qty *
                  unitWeight;


        if (
            !Number.isFinite(
                totalWeight
            ) ||
            totalWeight < 0
        ) {

            throw new Error(
                "Total weight is invalid"
            );

        }


        // -------------------------------------------------
        // TOTAL PRICE
        // -------------------------------------------------

        const suppliedTotal =

            data.total_price ??

            old?.total_price;


        const totalPrice =

            suppliedTotal !==
                undefined &&

            suppliedTotal !==
                null &&

            suppliedTotal !==
                ""

                ? Number(
                    suppliedTotal
                )

                : 0;


        if (
            !Number.isFinite(
                totalPrice
            ) ||
            totalPrice < 0
        ) {

            throw new Error(
                "Total price is invalid"
            );

        }


        // -------------------------------------------------
        // UNIT PRICE
        //
        // Total Price ÷ Quantity
        // -------------------------------------------------

        const unitPrice =
            qty > 0

                ? totalPrice /
                  qty

                : 0;


        if (
            !Number.isFinite(
                unitPrice
            ) ||
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
    // BUILD EXPORT VALUES
    //
    // เตรียมข้อมูลก่อน INSERT / UPDATE
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
            // DATE
            // -------------------------------------------------

            invoice_date:

                data.invoice_date ??

                old?.invoice_date ??

                null,


            // -------------------------------------------------
            // DOCUMENT FILES
            // -------------------------------------------------

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


    // =====================================================
    // STOCK OPTIONS
    //
    // ข้อมูลที่ส่งต่อให้ StockService
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

            product_name:
                product.name,

            movement_no:
                movementNo,

            reference_type:
                type,

            reference_no:
                invoiceNo,

            unit_weight:
                calc.unitWeight,

            total_weight:
                calc.totalWeight,

            unit_cost:
                calc.unitPrice,

            total_cost:
                calc.totalPrice,

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

                `Export Invoice ${invoiceNo}`,

            created_by:

                data.created_by ??

                ""

        };

    }


    // =====================================================
    // VALIDATE STOCK
    //
    // ตรวจสอบ Stock ก่อน Export
    //
    // สำคัญ:
    // แก้จาก Source ที่ส่งมาโดยลบ
    // block ที่ซ้ำใน WAREHOUSE ออก
    // เพราะทำให้ JavaScript syntax ผิด
    // =====================================================

    async validateStock(
        productCode,
        qty,
        options = {}
    ) {

        const code =
            String(
                productCode ??
                ""
            ).trim();


        if (
            !code
        ) {

            throw new Error(
                "Product number is required"
            );

        }


        const requestedQty =
            Number(
                qty
            );


        if (
            !Number.isFinite(
                requestedQty
            ) ||
            requestedQty <= 0
        ) {

            throw new Error(
                "Export quantity is invalid"
            );

        }


        // -------------------------------------------------
        // ถ้า StockService รองรับหลาย Stock Rows
        // ให้รวม Available Stock ที่ตรงเงื่อนไข
        // -------------------------------------------------

        if (
            typeof
            StockService.getStockRowsByProduct
            ===
            "function"
        ) {

            const rows =
                await StockService
                    .getStockRowsByProduct(
                        code
                    );


            const filtered =
                rows.filter(
                    stock => {

                        const available =
                            Number(
                                stock.available_qty ??
                                stock.qty ??
                                0
                            );


                        if (
                            !Number.isFinite(
                                available
                            ) ||
                            available <= 0
                        ) {

                            return false;

                        }


                        // -----------------------------------------
                        // WAREHOUSE
                        // -----------------------------------------

                        if (

                            options.warehouse_id !==
                                undefined &&

                            options.warehouse_id !==
                                null &&

                            options.warehouse_id !==
                                ""

                        ) {

                            if (

                                String(
                                    stock.warehouse_id
                                )

                                !==

                                String(
                                    options.warehouse_id
                                )

                            ) {

                                return false;

                            }

                        }


                        // -----------------------------------------
                        // LOCATION
                        // -----------------------------------------

                        if (

                            options.location &&

                            String(
                                stock.location ??
                                ""
                            )

                            !==

                            String(
                                options.location
                            )

                        ) {

                            return false;

                        }


                        // -----------------------------------------
                        // LOT
                        // -----------------------------------------

                        if (

                            options.lot_no &&

                            String(
                                stock.lot_no ??
                                ""
                            )

                            !==

                            String(
                                options.lot_no
                            )

                        ) {

                            return false;

                        }


                        // -----------------------------------------
                        // BATCH
                        // -----------------------------------------

                        if (

                            options.batch_no &&

                            String(
                                stock.batch_no ??
                                ""
                            )

                            !==

                            String(
                                options.batch_no
                            )

                        ) {

                            return false;

                        }


                        // -----------------------------------------
                        // SERIAL
                        // -----------------------------------------

                        if (

                            options.serial_no &&

                            String(
                                stock.serial_no ??
                                ""
                            )

                            !==

                            String(
                                options.serial_no
                            )

                        ) {

                            return false;

                        }


                        return true;

                    }
                );


            const available =
                filtered.reduce(
                    (
                        total,
                        stock
                    ) => {

                        return (

                            total +

                            Number(
                                stock.available_qty ??
                                stock.qty ??
                                0
                            )

                        );

                    },
                    0
                );


            if (
                available <
                requestedQty
            ) {

                throw new Error(
                    `Stock not enough. Available: ${available}, Requested: ${requestedQty}`
                );

            }


            return {

                available,

                rows:
                    filtered

            };

        }


        // -------------------------------------------------
        // FALLBACK
        //
        // รองรับ StockService รุ่นที่มี getByProduct()
        // -------------------------------------------------

        const stock =
            await StockService.getByProduct(
                code
            );


        if (
            !stock
        ) {

            throw new Error(
                "Stock not found"
            );

        }


        const available =
            Number(

                stock.available_qty ??

                stock.qty ??

                0

            );


        if (
            !Number.isFinite(
                available
            )
        ) {

            throw new Error(
                "Available stock is invalid"
            );

        }


        if (
            available <
            requestedQty
        ) {

            throw new Error(
                `Stock not enough. Available: ${available}, Requested: ${requestedQty}`
            );

        }


        return {

            available,

            stock

        };

    }


    // =====================================================
    // CREATE EXPORT
    //
    // ใช้ Transaction
    //
    // Export INSERT + Stock ISSUE
    // ต้องสำเร็จไปด้วยกัน
    // =====================================================

    async create(
        data = {}
    ) {

        return await transaction(
            async () => {

                const product =
                    this.buildProduct(
                        data
                    );


                const calc =
                    this.calculate(
                        data
                    );


                const values =
                    this.buildValues(
                        data,

                        product,

                        calc
                    );


                // -------------------------------------------------
                // REQUIRED INVOICE
                // -------------------------------------------------

                if (
                    !values.invoice_no
                ) {

                    throw new Error(
                        "Invoice No is required"
                    );

                }


                // -------------------------------------------------
                // REQUIRED DATE
                // -------------------------------------------------

                if (
                    !values.invoice_date
                ) {

                    throw new Error(
                        "Invoice Date is required"
                    );

                }


                // -------------------------------------------------
                // STOCK OPTIONS
                // -------------------------------------------------

                const stockOptions =
                    this.stockOptions(

                        data,

                        product,

                        calc,

                        values.invoice_no,

                        "EXPORT-PRECHECK",

                        "EXPORT"

                    );


                // -------------------------------------------------
                // VALIDATE STOCK
                // -------------------------------------------------

                await this.validateStock(

                    product.code,

                    calc.qty,

                    stockOptions

                );


                // -------------------------------------------------
                // DUPLICATE CHECK
                //
                // Invoice เดียวกัน + Product เดียวกัน
                // ห้ามสร้างซ้ำ
                // -------------------------------------------------

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


                if (
                    duplicate
                ) {

                    throw new Error(
                        "Export already exists for this invoice and product"
                    );

                }


                // -------------------------------------------------
                // INSERT EXPORT
                // -------------------------------------------------

                const result =
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

                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?,
                            ?

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


                if (
                    !result?.id
                ) {

                    throw new Error(
                        "Failed to create export"
                    );

                }


                // -------------------------------------------------
                // ตัด Stock หลังจากสร้าง Export
                // -------------------------------------------------

                const stock =
                    await StockService.issue(

                        product.code,

                        calc.qty,

                        this.stockOptions(

                            data,

                            product,

                            calc,

                            values.invoice_no,

                            `EXP-${result.id}`,

                            "EXPORT"

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

            }
        );

    }


    // =====================================================
    // UPDATE EXPORT
    //
    // 1. อ่าน Export เดิม
    // 2. Reverse Stock เดิม
    // 3. Validate Stock ใหม่
    // 4. Issue Stock ใหม่
    // 5. Update Database
    //
    // ถ้าเกิด Error
    // พยายาม Restore Stock เดิม
    // =====================================================

    async update(
        id,
        data = {}
    ) {

        return await transaction(
            async () => {

                const exportId =
                    this.normalizeId(
                        id
                    );


                // -------------------------------------------------
                // อ่านข้อมูลเดิม
                // -------------------------------------------------

                const old =
                    await this.getById(
                        exportId
                    );


                if (
                    !old
                ) {

                    throw new Error(
                        "Export not found"
                    );

                }


                // -------------------------------------------------
                // เตรียมข้อมูลใหม่
                // -------------------------------------------------

                const product =
                    this.buildProduct(

                        data,

                        old

                    );


                const calc =
                    this.calculate(

                        data,

                        old

                    );


                const values =
                    this.buildValues(

                        data,

                        product,

                        calc,

                        old

                    );


                if (
                    !values.invoice_no
                ) {

                    throw new Error(
                        "Invoice No is required"
                    );

                }


                if (
                    !values.invoice_date
                ) {

                    throw new Error(
                        "Invoice Date is required"
                    );

                }


                // -------------------------------------------------
                // ตรวจ Duplicate
                // -------------------------------------------------

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

                        exportId

                    ]);


                if (
                    duplicate
                ) {

                    throw new Error(
                        "Export already exists for this invoice and product"
                    );

                }


                // -------------------------------------------------
                // Stock เดิม
                // -------------------------------------------------

                const oldQty =
                    Number(
                        old.qty ||
                        0
                    );


                const oldTotalPrice =
                    Number(
                        old.total_price ||
                        0
                    );


                if (
                    !Number.isFinite(
                        oldQty
                    ) ||
                    oldQty <= 0
                ) {

                    throw new Error(
                        "Old export quantity is invalid"
                    );

                }


                if (
                    !Number.isFinite(
                        oldTotalPrice
                    ) ||
                    oldTotalPrice < 0
                ) {

                    throw new Error(
                        "Old export total price is invalid"
                    );

                }


                const oldUnitCost =
                    oldQty > 0

                        ? oldTotalPrice /
                          oldQty

                        : 0;


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
                // คืน Stock เดิม
                // -------------------------------------------------

                await StockService.reverseIssue(

                    oldProductCode,

                    oldQty,

                    {

                        movement_no:
                            `EXP-${exportId}-EDIT-REVERSE`,

                        reference_type:
                            "EXPORT_EDIT",

                        reference_no:
                            old.invoice_no ||
                            "",

                        unit_cost:
                            oldUnitCost,

                        total_cost:
                            oldTotalPrice,

                        remark:
                            `Reverse Export Edit #${exportId}`

                    }

                );


                // -------------------------------------------------
                // ตรวจ Stock ใหม่
                // -------------------------------------------------

                const newStockOptions =
                    this.stockOptions(

                        data,

                        product,

                        calc,

                        values.invoice_no,

                        `EXP-${exportId}-EDIT-PRECHECK`,

                        "EXPORT_EDIT"

                    );


                await this.validateStock(

                    product.code,

                    calc.qty,

                    newStockOptions

                );


                // -------------------------------------------------
                // ตัด Stock ใหม่
                // -------------------------------------------------

                const newStock =
                    await StockService.issue(

                        product.code,

                        calc.qty,

                        this.stockOptions(

                            data,

                            product,

                            calc,

                            values.invoice_no,

                            `EXP-${exportId}-EDIT`,

                            "EXPORT_EDIT"

                        )

                    );


                // -------------------------------------------------
                // UPDATE DATABASE
                // -------------------------------------------------

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

                        exportId

                    ]);


                if (
                    !result ||
                    result.changes === 0
                ) {

                    throw new Error(
                        "Failed to update export"
                    );

                }


                return {

                    ...result,

                    id:
                        exportId,

                    invoice_no:
                        values.invoice_no,

                    product_code:
                        values.product_code,

                    product_name:
                        values.product_name,

                    qty:
                        values.qty,

                    unit:
                        values.unit,

                    unit_weight:
                        values.unit_weight,

                    weight:
                        values.weight,

                    unit_price:
                        values.unit_price,

                    total_price:
                        values.total_price,

                    stock:
                        newStock

                };

            }
        );

    }


    // =====================================================
    // DELETE FILE
    //
    // ลบเอกสาร Export ทีละไฟล์
    //
    // ใช้ whitelist เพื่อป้องกัน SQL Injection
    // =====================================================

    async deleteFile(
        id,
        field
    ) {

        const exportId =
            this.normalizeId(
                id
            );


        const allowedFields = [

            "invoice_file",

            "payment_file",

            "formd_file",

            "phytos_file",

            "tax_file",

            "export_license_file",

            "origin_file",

            "acdd_file"

        ];


        if (
            !allowedFields.includes(
                field
            )
        ) {

            throw new Error(
                "Invalid export file field"
            );

        }


        // -------------------------------------------------
        // อ่าน Export
        // -------------------------------------------------

        const exportData =
            await this.getById(
                exportId
            );


        if (
            !exportData
        ) {

            throw new Error(
                "Export not found"
            );

        }


        const fileName =
            String(
                exportData[field] ||
                ""
            ).trim();


        if (
            !fileName
        ) {

            return {

                id:
                    exportId,

                field,

                file:
                    null,

                deleted:
                    false

            };

        }


        // -------------------------------------------------
        // ลบชื่อไฟล์จาก Database
        // -------------------------------------------------

        const result =
            await run(`
                UPDATE export_invoice
                SET

                    ${field} = NULL,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = ?
            `, [

                exportId

            ]);


        if (
            !result ||
            result.changes === 0
        ) {

            throw new Error(
                "Failed to delete export file"
            );

        }


        // -------------------------------------------------
        // ลบ Physical File
        //
        // path.basename()
        // ป้องกัน path traversal
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
            // ถ้าไฟล์ไม่มีอยู่แล้ว
            // Database ยังถือว่าลบสำเร็จ
            // -------------------------------------------------

            if (
                error.code !==
                "ENOENT"
            ) {

                console.error(

                    `EXPORT FILE DELETE ERROR #${exportId} ${field}:`,

                    error

                );

            }

        }


        return {

            id:
                exportId,

            field,

            file:
                fileName,

            deleted:
                true

        };

    }


    // =====================================================
    // DELETE ALL PHYSICAL FILES
    //
    // ใช้ตอนลบ Export ทั้งรายการ
    // =====================================================

    async deletePhysicalFiles(
        exportData = {}
    ) {

        const fileFields = [

            "invoice_file",

            "payment_file",

            "formd_file",

            "phytos_file",

            "tax_file",

            "export_license_file",

            "origin_file",

            "acdd_file"

        ];


        const errors = [];


        for (
            const field
            of fileFields
        ) {

            const fileName =
                String(
                    exportData[field] ||
                    ""
                ).trim();


            if (
                !fileName
            ) {

                continue;

            }


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
                // ไฟล์ไม่มีอยู่แล้ว
                // ถือว่าไม่มีปัญหา
                // -------------------------------------------------

                if (
                    error.code ===
                    "ENOENT"
                ) {

                    continue;

                }


                console.error(

                    `EXPORT FILE DELETE ERROR ${field}:`,

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
    // DELETE EXPORT
    //
    // 1. GET EXPORT
    // 2. Validate Quantity
    // 3. Validate Price
    // 4. Validate Product
    // 5. Reverse Stock
    // 6. DELETE Database
    // 7. DELETE Physical Files
    //
    // ใช้ Transaction
    // เพื่อให้ Reverse Stock + DELETE
    // สำเร็จหรือ rollback พร้อมกัน
    // =====================================================

    async delete(
        id
    ) {

        return await transaction(
            async () => {

                const exportId =
                    this.normalizeId(
                        id
                    );


                // -------------------------------------------------
                // GET EXPORT
                // -------------------------------------------------

                const old =
                    await this.getById(
                        exportId
                    );


                if (
                    !old
                ) {

                    throw new Error(
                        "Export not found"
                    );

                }


                // -------------------------------------------------
                // Quantity
                // -------------------------------------------------

                const qty =
                    Number(
                        old.qty ||
                        0
                    );


                if (
                    !Number.isFinite(
                        qty
                    ) ||
                    qty <= 0
                ) {

                    throw new Error(
                        "Export quantity is invalid"
                    );

                }


                // -------------------------------------------------
                // Price
                // -------------------------------------------------

                const totalPrice =
                    Number(
                        old.total_price ||
                        0
                    );


                if (
                    !Number.isFinite(
                        totalPrice
                    ) ||
                    totalPrice < 0
                ) {

                    throw new Error(
                        "Export total price is invalid"
                    );

                }


                const unitCost =
                    qty > 0

                        ? totalPrice /
                          qty

                        : 0;


                // -------------------------------------------------
                // Product
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
                // คืน Stock
                //
                // Export เคยตัด Stock ไปแล้ว
                // เมื่อลบ Export ต้องคืน Stock
                // -------------------------------------------------

                await StockService.reverseIssue(

                    productCode,

                    qty,

                    {

                        movement_no:
                            `EXP-${exportId}-DELETE`,

                        reference_type:
                            "EXPORT_DELETE",

                        reference_no:
                            old.invoice_no ||
                            "",

                        unit_cost:
                            unitCost,

                        total_cost:
                            totalPrice,

                        remark:
                            `Delete Export #${exportId}`

                    }

                );


                // -------------------------------------------------
                // DELETE DATABASE
                // -------------------------------------------------

                const result =
                    await run(`
                        DELETE FROM export_invoice
                        WHERE id = ?
                    `, [

                        exportId

                    ]);


                if (
                    !result ||
                    result.changes === 0
                ) {

                    throw new Error(
                        "Failed to delete export"
                    );

                }


                // -------------------------------------------------
                // ลบ Physical Files
                // -------------------------------------------------

                const fileDeleteErrors =
                    await this.deletePhysicalFiles(
                        old
                    );


                return {

                    ...result,

                    id:
                        exportId,

                    fileDeleteErrors

                };

            }
        );

    }

}


// =========================================================
// EXPORT SERVICE INSTANCE
//
// ไฟล์อื่นใน Backend ใช้:
//
// const ExportService =
//     require("../services/exportService");
//
// =========================================================

module.exports =
    new ExportService();