const {
    all,
    get,
    run
} = require(
    "../config/database"
);


// =========================================================
// STOCK SERVICE
//
// Path:
// backend/services/stockService.js
//
// =========================================================
//
// FLOW
//
// IMPORT
//      ↓
// receive()
//      ↓
// STOCK +
//
// EXPORT
//      ↓
// issue()
//      ↓
// STOCK -
//
// EDIT IMPORT
//      ↓
// reverseReceive()
//      ↓
// receive()
//
// EDIT EXPORT
//      ↓
// reverseIssue()
//      ↓
// issue()
//
// =========================================================


class StockService {


    // =====================================================
    // NUMBER
    // =====================================================

    numberValue(
        value,
        defaultValue = 0
    ) {

        const number =
            Number(
                value
            );


        if (
            !Number.isFinite(
                number
            )
        ) {

            return defaultValue;

        }


        return number;

    }


    // =====================================================
    // POSITIVE NUMBER
    // =====================================================

    positiveNumber(
        value,
        fieldName = "Quantity"
    ) {

        const number =
            this.numberValue(
                value,
                0
            );


        if (
            number <= 0
        ) {

            throw new Error(
                `${fieldName} must be greater than 0`
            );

        }


        return number;

    }


    // =====================================================
    // TEXT
    // =====================================================

    textValue(
        value,
        defaultValue = ""
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return defaultValue;

        }


        return String(
            value
        ).trim();

    }


    // =====================================================
    // PRODUCT CODE
    // =====================================================

    normalizeProductCode(
        productCode
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
                "Product code is required"
            );

        }


        return code;

    }


    // =====================================================
    // TOTAL COST
    // =====================================================

    calculateTotalCost(
        qty,
        unitCost,
        totalCost = null
    ) {

        if (
            totalCost !== null &&
            totalCost !== undefined &&
            totalCost !== ""
        ) {

            const value =
                this.numberValue(
                    totalCost,
                    0
                );


            if (
                value >= 0
            ) {

                return value;

            }

        }


        return (
            this.numberValue(
                qty,
                0
            )
            *
            this.numberValue(
                unitCost,
                0
            )
        );

    }


    // =====================================================
    // UNIT COST
    // =====================================================

    calculateUnitCost(
        qty,
        unitCost,
        totalCost
    ) {

        const unit =
            this.numberValue(
                unitCost,
                0
            );


        if (
            unit > 0
        ) {

            return unit;

        }


        const quantity =
            this.numberValue(
                qty,
                0
            );


        const total =
            this.numberValue(
                totalCost,
                0
            );


        if (
            quantity > 0 &&
            total > 0
        ) {

            return (
                total /
                quantity
            );

        }


        return 0;

    }


    // =====================================================
    // GET ALL STOCK
    // =====================================================

    async getAll() {

        return await all(`
            SELECT *
            FROM stock
            ORDER BY id DESC
        `);

    }


    // =====================================================
    // GET STOCK BY ID
    // =====================================================

    async getById(
        id
    ) {

        const stockId =
            Number(
                id
            );


        if (
            !Number.isInteger(
                stockId
            )
            ||
            stockId <= 0
        ) {

            return null;

        }


        return await get(`
            SELECT *
            FROM stock
            WHERE id = ?
            LIMIT 1
        `, [

            stockId

        ]);

    }


    // =====================================================
    // GET STOCK ROWS BY PRODUCT
    // =====================================================

    async getStockRowsByProduct(
        productCode
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        return await all(`
            SELECT *
            FROM stock
            WHERE product_code = ?
            ORDER BY id ASC
        `, [

            code

        ]);

    }


    // =====================================================
    // GET STOCK BY PRODUCT
    // =====================================================

    async getByProduct(
        productCode
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        return await get(`
            SELECT *
            FROM stock
            WHERE product_code = ?
            ORDER BY id DESC
            LIMIT 1
        `, [

            code

        ]);

    }


    // =====================================================
    // FIND STOCK FOR RECEIVE
    // =====================================================

    async findStockForReceive(
        productCode,
        options = {}
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const warehouseId =
            options.warehouse_id ??
            null;


        const location =
            this.textValue(
                options.location
            );


        const lotNo =
            this.textValue(
                options.lot_no
            );


        const batchNo =
            this.textValue(
                options.batch_no
            );


        const serialNo =
            this.textValue(
                options.serial_no
            );


        return await get(`
            SELECT *
            FROM stock

            WHERE product_code = ?

            AND COALESCE(
                warehouse_id,
                0
            ) = COALESCE(
                ?,
                0
            )

            AND COALESCE(
                location,
                ''
            ) = ?

            AND COALESCE(
                lot_no,
                ''
            ) = ?

            AND COALESCE(
                batch_no,
                ''
            ) = ?

            AND COALESCE(
                serial_no,
                ''
            ) = ?

            ORDER BY id DESC

            LIMIT 1
        `, [

            code,

            warehouseId,

            location,

            lotNo,

            batchNo,

            serialNo

        ]);

    }


    // =====================================================
    // FIND STOCK FOR ISSUE
    // =====================================================

    async findStockForIssue(
        productCode,
        options = {}
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const rows =
            await this.getStockRowsByProduct(
                code
            );


        const warehouseId =
            options.warehouse_id ??
            null;


        const location =
            this.textValue(
                options.location
            );


        const lotNo =
            this.textValue(
                options.lot_no
            );


        const batchNo =
            this.textValue(
                options.batch_no
            );


        const serialNo =
            this.textValue(
                options.serial_no
            );


        const filtered =
            rows.filter(
                stock => {

                    const available =
                        this.numberValue(
                            stock.available_qty ??
                            stock.qty,
                            0
                        );


                    if (
                        available <= 0
                    ) {

                        return false;

                    }


                    if (
                        warehouseId !== null &&
                        warehouseId !== undefined
                    ) {

                        if (
                            String(
                                stock.warehouse_id
                            ) !==
                            String(
                                warehouseId
                            )
                        ) {

                            return false;

                        }

                    }


                    if (
                        location &&
                        this.textValue(
                            stock.location
                        ) !==
                        location
                    ) {

                        return false;

                    }


                    if (
                        lotNo &&
                        this.textValue(
                            stock.lot_no
                        ) !==
                        lotNo
                    ) {

                        return false;

                    }


                    if (
                        batchNo &&
                        this.textValue(
                            stock.batch_no
                        ) !==
                        batchNo
                    ) {

                        return false;

                    }


                    if (
                        serialNo &&
                        this.textValue(
                            stock.serial_no
                        ) !==
                        serialNo
                    ) {

                        return false;

                    }


                    return true;

                }
            );


        return filtered[0] ||
            null;

    }


    // =====================================================
    // INSERT STOCK MOVEMENT
    //
    // IMPORTANT
    //
    // stock_movements schema ปัจจุบันใช้:
    //
    // warehouse_from
    // warehouse_to
    //
    // location_from
    // location_to
    //
    // ไม่มี:
    //
    // unit
    // warehouse_id
    // location
    //
    // ดังนั้นห้าม INSERT column เหล่านั้น
    //
    // =====================================================

    async insertMovement(
        data = {}
    ) {

        const movementType =
            this.textValue(
                data.movement_type
            );


        const isIssue =
            movementType === "ISSUE" ||
            movementType === "OUT" ||
            movementType === "REVERSE_RECEIVE";


        const isReceive =
            movementType === "RECEIVE" ||
            movementType === "IN" ||
            movementType === "REVERSE_ISSUE";


        let warehouseFrom =
            data.warehouse_from ??
            null;


        let warehouseTo =
            data.warehouse_to ??
            null;


        let locationFrom =
            this.textValue(
                data.location_from
            );


        let locationTo =
            this.textValue(
                data.location_to
            );


        // -------------------------------------------------
        // Backward-compatible mapping
        //
        // Service เดิมส่ง:
        //
        // warehouse_id
        // location
        //
        // แปลงให้เข้ากับ schema ใหม่
        // -------------------------------------------------

        if (
            data.warehouse_id !== undefined &&
            data.warehouse_id !== null
        ) {

            if (
                isIssue
            ) {

                warehouseFrom =
                    data.warehouse_id;

            }


            if (
                isReceive
            ) {

                warehouseTo =
                    data.warehouse_id;

            }

        }


        if (
            data.location !== undefined &&
            data.location !== null
        ) {

            if (
                isIssue
            ) {

                locationFrom =
                    this.textValue(
                        data.location
                    );

            }


            if (
                isReceive
            ) {

                locationTo =
                    this.textValue(
                        data.location
                    );

            }

        }


        const result =
            await run(`
                INSERT INTO stock_movements (

                    movement_no,

                    movement_type,

                    product_code,

                    product_name,

                    stock_id,

                    reference_type,

                    reference_no,

                    qty,

                    before_qty,

                    after_qty,

                    unit_cost,

                    total_cost,

                    warehouse_from,

                    warehouse_to,

                    location_from,

                    location_to,

                    lot_no,

                    batch_no,

                    serial_no,

                    remark,

                    created_by

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
                    ?,
                    ?,
                    ?

                )
            `, [

                this.textValue(
                    data.movement_no
                ),

                movementType,

                this.textValue(
                    data.product_code
                ),

                this.textValue(
                    data.product_name
                ),

                data.stock_id ??
                null,

                this.textValue(
                    data.reference_type
                ),

                this.textValue(
                    data.reference_no
                ),

                this.numberValue(
                    data.qty,
                    0
                ),

                this.numberValue(
                    data.before_qty,
                    0
                ),

                this.numberValue(
                    data.after_qty,
                    0
                ),

                this.numberValue(
                    data.unit_cost,
                    0
                ),

                this.numberValue(
                    data.total_cost,
                    0
                ),

                warehouseFrom,

                warehouseTo,

                locationFrom,

                locationTo,

                this.textValue(
                    data.lot_no
                ),

                this.textValue(
                    data.batch_no
                ),

                this.textValue(
                    data.serial_no
                ),

                this.textValue(
                    data.remark
                ),

                this.textValue(
                    data.created_by
                )

            ]);


        return {

            id:
                result?.id ??
                null,

            changes:
                result?.changes ??
                0

        };

    }


    // =====================================================
    // RECEIVE STOCK
    //
    // Import → Stock +
    //
    // =====================================================

    async receive(
        productCode,
        quantity,
        options = {}
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const receiveQty =
            this.positiveNumber(
                quantity,
                "Receive quantity"
            );


        const productName =
            this.textValue(
                options.product_name
            );


        const unit =
            this.textValue(
                options.unit
            );


        const warehouseId =
            options.warehouse_id ??
            null;


        const location =
            this.textValue(
                options.location
            );


        const rack =
            this.textValue(
                options.rack
            );


        const shelf =
            this.textValue(
                options.shelf
            );


        const bin =
            this.textValue(
                options.bin
            );


        const lotNo =
            this.textValue(
                options.lot_no
            );


        const batchNo =
            this.textValue(
                options.batch_no
            );


        const serialNo =
            this.textValue(
                options.serial_no
            );


        const manufactureDate =
            options.manufacture_date ??
            null;


        const expireDate =
            options.expire_date ??
            null;


        const receiveDate =
            options.receive_date ??
            null;


        const unitCost =
            this.calculateUnitCost(
                receiveQty,
                options.unit_cost,
                options.total_cost
            );


        const totalCost =
            this.calculateTotalCost(
                receiveQty,
                unitCost,
                options.total_cost
            );


        // =================================================
        // FIND EXISTING STOCK
        // =================================================

        let stock =
            await this.findStockForReceive(
                code,
                options
            );


        // =================================================
        // UPDATE EXISTING STOCK
        // =================================================

        if (
            stock
        ) {

            const oldQty =
                this.numberValue(
                    stock.qty,
                    0
                );


            const oldReserved =
                this.numberValue(
                    stock.reserved_qty,
                    0
                );


            const oldAvailable =
                this.numberValue(
                    stock.available_qty,
                    Math.max(
                        0,
                        oldQty -
                        oldReserved
                    )
                );


            const oldTotalCost =
                this.numberValue(
                    stock.total_cost,
                    0
                );


            const newQty =
                oldQty +
                receiveQty;


            const newAvailable =
                oldAvailable +
                receiveQty;


            const newTotalCost =
                oldTotalCost +
                totalCost;


            const newUnitCost =
                newQty > 0
                    ? (
                        newTotalCost /
                        newQty
                    )
                    : 0;


            const result =
                await run(`
                    UPDATE stock

                    SET

                        product_name = ?,

                        qty = ?,

                        available_qty = ?,

                        unit = ?,

                        unit_cost = ?,

                        total_cost = ?,

                        warehouse_id = ?,

                        location = ?,

                        rack = ?,

                        shelf = ?,

                        bin = ?,

                        lot_no = ?,

                        batch_no = ?,

                        serial_no = ?,

                        manufacture_date = ?,

                        expire_date = ?,

                        receive_date = ?,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = ?
                `, [

                    productName ||
                    stock.product_name ||
                    "",

                    newQty,

                    newAvailable,

                    unit ||
                    stock.unit ||
                    "",

                    newUnitCost,

                    newTotalCost,

                    warehouseId,

                    location,

                    rack,

                    shelf,

                    bin,

                    lotNo,

                    batchNo,

                    serialNo,

                    manufactureDate,

                    expireDate,

                    receiveDate,

                    stock.id

                ]);


            if (
                !result ||
                result.changes === 0
            ) {

                throw new Error(
                    "Failed to receive stock"
                );

            }


            stock =
                await this.getById(
                    stock.id
                );

        }


        // =================================================
        // CREATE NEW STOCK
        // =================================================

        else {

            const result =
                await run(`
                    INSERT INTO stock (

                        product_code,

                        product_name,

                        qty,

                        reserved_qty,

                        available_qty,

                        unit,

                        warehouse_id,

                        location,

                        rack,

                        shelf,

                        bin,

                        lot_no,

                        batch_no,

                        serial_no,

                        manufacture_date,

                        expire_date,

                        receive_date,

                        unit_cost,

                        total_cost,

                        created_by

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
                        ?,
                        ?

                    )
                `, [

                    code,

                    productName,

                    receiveQty,

                    0,

                    receiveQty,

                    unit,

                    warehouseId,

                    location,

                    rack,

                    shelf,

                    bin,

                    lotNo,

                    batchNo,

                    serialNo,

                    manufactureDate,

                    expireDate,

                    receiveDate,

                    unitCost,

                    totalCost,

                    this.textValue(
                        options.created_by
                    )

                ]);


            if (
                !result ||
                !result.id
            ) {

                throw new Error(
                    "Failed to create stock"
                );

            }


            stock =
                await this.getById(
                    result.id
                );

        }


        // =================================================
        // MOVEMENT
        // =================================================

        await this.insertMovement({

            movement_no:
                options.movement_no ||
                "",

            movement_type:
                options.movement_type ||
                "RECEIVE",

            product_code:
                code,

            product_name:
                stock.product_name ||
                productName,

            stock_id:
                stock.id,

            qty:
                receiveQty,

            before_qty:
                Math.max(
                    0,
                    this.numberValue(
                        stock.qty,
                        0
                    ) -
                    receiveQty
                ),

            after_qty:
                this.numberValue(
                    stock.qty,
                    0
                ),

            warehouse_to:
                stock.warehouse_id,

            location_to:
                stock.location,

            lot_no:
                stock.lot_no,

            batch_no:
                stock.batch_no,

            serial_no:
                stock.serial_no,

            reference_type:
                options.reference_type ||
                "RECEIVE",

            reference_no:
                options.reference_no ||
                "",

            unit_cost:
                unitCost,

            total_cost:
                totalCost,

            remark:
                options.remark ||
                "Stock received",

            created_by:
                options.created_by ||
                ""

        });


        return stock;

    }


    // =====================================================
    // ISSUE STOCK
    //
    // Export → Stock -
    //
    // FIFO
    //
    // =====================================================

    async issue(
        productCode,
        quantity,
        options = {}
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const issueQty =
            this.positiveNumber(
                quantity,
                "Issue quantity"
            );


        const rows =
            await this.getStockRowsByProduct(
                code
            );


        if (
            rows.length === 0
        ) {

            throw new Error(
                "Stock not found"
            );

        }


        // =================================================
        // FILTER
        // =================================================

        const filteredRows =
            rows.filter(
                stock => {

                    const available =
                        this.numberValue(
                            stock.available_qty ??
                            stock.qty,
                            0
                        );


                    if (
                        available <= 0
                    ) {

                        return false;

                    }


                    if (
                        options.warehouse_id !==
                        undefined
                        &&
                        options.warehouse_id !==
                        null
                        &&
                        options.warehouse_id !==
                        ""
                    ) {

                        if (
                            String(
                                stock.warehouse_id
                            ) !==
                            String(
                                options.warehouse_id
                            )
                        ) {

                            return false;

                        }

                    }


                    if (
                        options.location
                        &&
                        this.textValue(
                            stock.location
                        ) !==
                        this.textValue(
                            options.location
                        )
                    ) {

                        return false;

                    }


                    if (
                        options.lot_no
                        &&
                        this.textValue(
                            stock.lot_no
                        ) !==
                        this.textValue(
                            options.lot_no
                        )
                    ) {

                        return false;

                    }


                    if (
                        options.batch_no
                        &&
                        this.textValue(
                            stock.batch_no
                        ) !==
                        this.textValue(
                            options.batch_no
                        )
                    ) {

                        return false;

                    }


                    if (
                        options.serial_no
                        &&
                        this.textValue(
                            stock.serial_no
                        ) !==
                        this.textValue(
                            options.serial_no
                        )
                    ) {

                        return false;

                    }


                    return true;

                }
            );


        const totalAvailable =
            filteredRows.reduce(
                (
                    total,
                    stock
                ) => {

                    return (
                        total +
                        this.numberValue(
                            stock.available_qty ??
                            stock.qty,
                            0
                        )
                    );

                },
                0
            );


        if (
            totalAvailable <
            issueQty
        ) {

            throw new Error(
                `Insufficient stock. Available: ${totalAvailable}`
            );

        }


        // =================================================
        // ISSUE
        // =================================================

        let remaining =
            issueQty;


        const items =
            [];


        for (
            const stock
            of filteredRows
        ) {

            if (
                remaining <= 0
            ) {

                break;

            }


            const currentQty =
                this.numberValue(
                    stock.qty,
                    0
                );


            const currentAvailable =
                this.numberValue(
                    stock.available_qty ??
                    stock.qty,
                    0
                );


            const deduct =
                Math.min(
                    currentAvailable,
                    remaining
                );


            const newQty =
                Math.max(
                    0,
                    currentQty -
                    deduct
                );


            const newAvailable =
                Math.max(
                    0,
                    currentAvailable -
                    deduct
                );


            const unitCost =
                this.numberValue(
                    stock.unit_cost,
                    0
                );


            const movementCost =
                unitCost *
                deduct;


            const oldTotalCost =
                this.numberValue(
                    stock.total_cost,
                    0
                );


            const newTotalCost =
                Math.max(
                    0,
                    oldTotalCost -
                    movementCost
                );


            const result =
                await run(`
                    UPDATE stock

                    SET

                        qty = ?,

                        available_qty = ?,

                        total_cost = ?,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = ?
                `, [

                    newQty,

                    newAvailable,

                    newTotalCost,

                    stock.id

                ]);


            if (
                !result ||
                result.changes === 0
            ) {

                throw new Error(
                    "Failed to issue stock"
                );

            }


            await this.insertMovement({

                movement_no:
                    options.movement_no ||
                    "",

                movement_type:
                    options.movement_type ||
                    "ISSUE",

                product_code:
                    code,

                product_name:
                    stock.product_name ||
                    options.product_name ||
                    "",

                stock_id:
                    stock.id,

                qty:
                    deduct,

                before_qty:
                    currentQty,

                after_qty:
                    newQty,

                warehouse_from:
                    stock.warehouse_id,

                location_from:
                    stock.location,

                lot_no:
                    stock.lot_no,

                batch_no:
                    stock.batch_no,

                serial_no:
                    stock.serial_no,

                reference_type:
                    options.reference_type ||
                    "ISSUE",

                reference_no:
                    options.reference_no ||
                    "",

                unit_cost:
                    unitCost,

                total_cost:
                    movementCost,

                remark:
                    options.remark ||
                    "Stock issued",

                created_by:
                    options.created_by ||
                    ""

            });


            items.push({

                stock_id:
                    stock.id,

                product_code:
                    code,

                product_name:
                    stock.product_name ||
                    "",

                qty:
                    deduct,

                unit_cost:
                    unitCost,

                total_cost:
                    movementCost

            });


            remaining -=
                deduct;

        }


        if (
            remaining > 0
        ) {

            throw new Error(
                "Failed to complete stock issue"
            );

        }


        return {

            product_code:
                code,

            issued_qty:
                issueQty,

            items

        };

    }


    // =====================================================
    // REVERSE RECEIVE
    //
    // ใช้ตอน:
    //
    // EDIT IMPORT
    // DELETE IMPORT
    //
    // =====================================================

    async reverseReceive(
        productCode,
        quantity,
        options = {}
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const reverseQty =
            this.positiveNumber(
                quantity,
                "Reverse receive quantity"
            );


        const rows =
            await this.getStockRowsByProduct(
                code
            );


        if (
            rows.length === 0
        ) {

            throw new Error(
                "Stock not found"
            );

        }


        let remaining =
            reverseQty;


        const unitCost =
            this.numberValue(
                options.unit_cost,
                0
            );


        const totalCost =
            this.numberValue(
                options.total_cost,
                unitCost *
                reverseQty
            );


        const candidates =
            rows
                .filter(
                    stock =>
                        this.numberValue(
                            stock.qty,
                            0
                        ) > 0
                )
                .sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            b.id
                        )
                        -
                        Number(
                            a.id
                        )
                );


        const availableTotal =
            candidates.reduce(
                (
                    total,
                    stock
                ) =>
                    total +
                    this.numberValue(
                        stock.qty,
                        0
                    ),
                0
            );


        if (
            availableTotal <
            reverseQty
        ) {

            throw new Error(
                `Cannot reverse receive. Available stock: ${availableTotal}`
            );

        }


        for (
            const stock
            of candidates
        ) {

            if (
                remaining <= 0
            ) {

                break;

            }


            const currentQty =
                this.numberValue(
                    stock.qty,
                    0
                );


            const currentAvailable =
                this.numberValue(
                    stock.available_qty,
                    Math.max(
                        0,
                        currentQty -
                        this.numberValue(
                            stock.reserved_qty,
                            0
                        )
                    )
                );


            const reservedQty =
                this.numberValue(
                    stock.reserved_qty,
                    0
                );


            const removable =
                Math.min(
                    currentAvailable,
                    remaining
                );


            if (
                removable <= 0
            ) {

                continue;

            }


            const newQty =
                currentQty -
                removable;


            const newAvailable =
                currentAvailable -
                removable;


            const oldTotalCost =
                this.numberValue(
                    stock.total_cost,
                    0
                );


            const removeCost =
                unitCost > 0
                    ? unitCost *
                      removable
                    : (
                        currentQty > 0
                            ? (
                                oldTotalCost /
                                currentQty
                            ) *
                            removable
                            : 0
                    );


            const newTotalCost =
                Math.max(
                    0,
                    oldTotalCost -
                    removeCost
                );


            const result =
                await run(`
                    UPDATE stock

                    SET

                        qty = ?,

                        available_qty = ?,

                        reserved_qty = ?,

                        total_cost = ?,

                        updated_at =
                            CURRENT_TIMESTAMP

                    WHERE id = ?
                `, [

                    newQty,

                    newAvailable,

                    reservedQty,

                    newTotalCost,

                    stock.id

                ]);


            if (
                !result ||
                result.changes === 0
            ) {

                throw new Error(
                    "Failed to reverse received stock"
                );

            }


            await this.insertMovement({

                movement_no:
                    options.movement_no ||
                    "",

                movement_type:
                    options.movement_type ||
                    "REVERSE_RECEIVE",

                product_code:
                    code,

                product_name:
                    stock.product_name ||
                    options.product_name ||
                    "",

                stock_id:
                    stock.id,

                qty:
                    removable,

                before_qty:
                    currentQty,

                after_qty:
                    newQty,

                warehouse_from:
                    stock.warehouse_id,

                location_from:
                    stock.location,

                lot_no:
                    stock.lot_no,

                batch_no:
                    stock.batch_no,

                serial_no:
                    stock.serial_no,

                reference_type:
                    options.reference_type ||
                    "REVERSE_RECEIVE",

                reference_no:
                    options.reference_no ||
                    "",

                unit_cost:
                    unitCost,

                total_cost:
                    removeCost,

                remark:
                    options.remark ||
                    "Reverse received stock",

                created_by:
                    options.created_by ||
                    ""

            });


            remaining -=
                removable;

        }


        if (
            remaining > 0
        ) {

            throw new Error(
                "Failed to reverse receive completely"
            );

        }


        return {

            product_code:
                code,

            reversed_qty:
                reverseQty,

            total_cost:
                totalCost

        };

    }


    // =====================================================
    // REVERSE ISSUE
    //
    // ใช้ตอน Edit / Rollback Export
    // =====================================================

    async reverseIssue(
        productCode,
        quantity,
        options = {}
    ) {

        const result =
            await this.receive(

                productCode,

                quantity,

                {

                    ...options,

                    movement_type:
                        options.movement_type ||
                        "REVERSE_ISSUE",

                    reference_type:
                        options.reference_type ||
                        "REVERSE_ISSUE",

                    remark:
                        options.remark ||
                        "Reverse issued stock"

                }

            );


        return result;

    }


    // =====================================================
    // RESERVE STOCK
    // =====================================================

    async reserveStock(
        productCode,
        quantity
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const reserveQty =
            this.positiveNumber(
                quantity,
                "Reserve quantity"
            );


        const stock =
            await this.getByProduct(
                code
            );


        if (
            !stock
        ) {

            throw new Error(
                "Stock not found"
            );

        }


        const currentQty =
            this.numberValue(
                stock.qty,
                0
            );


        const reservedQty =
            this.numberValue(
                stock.reserved_qty,
                0
            );


        const availableQty =
            this.numberValue(
                stock.available_qty,
                Math.max(
                    0,
                    currentQty -
                    reservedQty
                )
            );


        if (
            reserveQty >
            availableQty
        ) {

            throw new Error(
                `Insufficient available stock. Available: ${availableQty}`
            );

        }


        const newReserved =
            reservedQty +
            reserveQty;


        const newAvailable =
            availableQty -
            reserveQty;


        const result =
            await run(`
                UPDATE stock

                SET

                    reserved_qty = ?,

                    available_qty = ?,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = ?
            `, [

                newReserved,

                newAvailable,

                stock.id

            ]);


        if (
            !result ||
            result.changes === 0
        ) {

            throw new Error(
                "Failed to reserve stock"
            );

        }


        return await this.getById(
            stock.id
        );

    }


    // =====================================================
    // RELEASE RESERVED STOCK
    // =====================================================

    async releaseReserve(
        productCode,
        quantity
    ) {

        const code =
            this.normalizeProductCode(
                productCode
            );


        const releaseQty =
            this.positiveNumber(
                quantity,
                "Release quantity"
            );


        const stock =
            await this.getByProduct(
                code
            );


        if (
            !stock
        ) {

            throw new Error(
                "Stock not found"
            );

        }


        const reservedQty =
            this.numberValue(
                stock.reserved_qty,
                0
            );


        if (
            releaseQty >
            reservedQty
        ) {

            throw new Error(
                "Release quantity exceeds reserved stock"
            );

        }


        const availableQty =
            this.numberValue(
                stock.available_qty,
                0
            );


        const newReserved =
            reservedQty -
            releaseQty;


        const newAvailable =
            availableQty +
            releaseQty;


        const result =
            await run(`
                UPDATE stock

                SET

                    reserved_qty = ?,

                    available_qty = ?,

                    updated_at =
                        CURRENT_TIMESTAMP

                WHERE id = ?
            `, [

                newReserved,

                newAvailable,

                stock.id

            ]);


        if (
            !result ||
            result.changes === 0
        ) {

            throw new Error(
                "Failed to release reserved stock"
            );

        }


        return await this.getById(
            stock.id
        );

    }


    // =====================================================
    // LOW STOCK
    // =====================================================

    async lowStock(
        minimumQty = 0
    ) {

        const minimum =
            this.numberValue(
                minimumQty,
                0
            );


        return await all(`
            SELECT *
            FROM stock
            WHERE qty <= ?
            ORDER BY qty ASC, id ASC
        `, [

            minimum

        ]);

    }


    // =====================================================
    // DASHBOARD SUMMARY
    // =====================================================

    async dashboardSummary() {

        const summary =
            await get(`
                SELECT

                    COUNT(*) AS total_products,

                    COALESCE(
                        SUM(qty),
                        0
                    ) AS total_qty,

                    COALESCE(
                        SUM(available_qty),
                        0
                    ) AS available_qty,

                    COALESCE(
                        SUM(reserved_qty),
                        0
                    ) AS reserved_qty,

                    COALESCE(
                        SUM(total_cost),
                        0
                    ) AS total_value

                FROM stock
            `);


        return {

            totalProducts:
                this.numberValue(
                    summary?.total_products,
                    0
                ),

            totalQty:
                this.numberValue(
                    summary?.total_qty,
                    0
                ),

            availableQty:
                this.numberValue(
                    summary?.available_qty,
                    0
                ),

            reservedQty:
                this.numberValue(
                    summary?.reserved_qty,
                    0
                ),

            totalValue:
                this.numberValue(
                    summary?.total_value,
                    0
                )

        };

    }


}


// =========================================================
// EXPORT
// =========================================================

module.exports =
    new StockService();