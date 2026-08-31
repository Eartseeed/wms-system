const {
    all,
    get,
    run
} = require("../config/database");


// ======================================================
// STOCK SERVICE
// ======================================================

class StockService {


    // ======================================================
    // GET ALL STOCK
    // ======================================================

    async getAll() {

        return await all(`

            SELECT

                s.*

            FROM stock s

            WHERE s.status = 1

            ORDER BY s.id DESC

        `);

    }


    // ======================================================
    // GET STOCK BY PRODUCT CODE
    // ======================================================

    async getByProduct(productCode) {

        if (!productCode) {

            throw new Error(
                "Product Code is required"
            );

        }


        return await get(`

            SELECT

                s.*

            FROM stock s

            WHERE s.product_code = ?

            AND s.status = 1

            ORDER BY s.id DESC

            LIMIT 1

        `, [

            productCode

        ]);

    }


    // ======================================================
    // CREATE STOCK
    // ======================================================

    async create(data = {}) {

        const productCode =
            String(
                data.product_code ??
                ""
            ).trim();


        const productName =
            String(
                data.product_name ??
                ""
            ).trim();


        const qty =
            Number(
                data.qty ??
                data.quantity ??
                0
            );


        if (!productCode) {

            throw new Error(
                "Product Code is required"
            );

        }


        if (!productName) {

            throw new Error(
                "Product Name is required"
            );

        }


        if (
            !Number.isFinite(qty) ||
            qty < 0
        ) {

            throw new Error(
                "Stock quantity cannot be negative"
            );

        }


        const reservedQty =
            Number(
                data.reserved_qty ??
                0
            );


        if (
            !Number.isFinite(
                reservedQty
            ) ||
            reservedQty < 0
        ) {

            throw new Error(
                "Reserved quantity is invalid"
            );

        }


        if (
            reservedQty >
            qty
        ) {

            throw new Error(
                "Reserved quantity cannot exceed stock quantity"
            );

        }


        const availableQty =
            qty -
            reservedQty;


        const damageQty =
            Number(
                data.damage_qty ??
                0
            );


        const holdQty =
            Number(
                data.hold_qty ??
                0
            );


        const onwayQty =
            Number(
                data.onway_qty ??
                0
            );


        const unitCost =
            Number(
                data.unit_cost ??
                0
            );


        const totalCost =
            Number(
                data.total_cost ??
                (
                    qty *
                    unitCost
                )
            );


        if (
            !Number.isFinite(
                damageQty
            ) ||
            damageQty < 0
        ) {

            throw new Error(
                "Damage quantity is invalid"
            );

        }


        if (
            !Number.isFinite(
                holdQty
            ) ||
            holdQty < 0
        ) {

            throw new Error(
                "Hold quantity is invalid"
            );

        }


        if (
            !Number.isFinite(
                onwayQty
            ) ||
            onwayQty < 0
        ) {

            throw new Error(
                "Onway quantity is invalid"
            );

        }


        if (
            !Number.isFinite(
                unitCost
            ) ||
            unitCost < 0
        ) {

            throw new Error(
                "Unit cost is invalid"
            );

        }


        if (
            !Number.isFinite(
                totalCost
            ) ||
            totalCost < 0
        ) {

            throw new Error(
                "Total cost is invalid"
            );

        }


        const result =
            await run(`

                INSERT INTO stock (

                    product_code,

                    product_name,

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

                    qty,

                    unit_weight,

                    total_weight,

                    reserved_qty,

                    available_qty,

                    damage_qty,

                    hold_qty,

                    onway_qty,

                    unit_cost,

                    total_cost,

                    last_in,

                    remark,

                    status,

                    created_at,

                    updated_at

                )

                VALUES (

                    ?,?,?,?,?,?,?,?,?,?,

                    ?,?,?,?,?,?,?,?,?,?,

                    ?,?,

                    CURRENT_TIMESTAMP,

                    ?,

                    1,

                    CURRENT_TIMESTAMP,

                    CURRENT_TIMESTAMP

                )

            `, [

                productCode,

                productName,

                data.warehouse_id ??
                    null,

                data.location ??
                    "",

                data.rack ??
                    "",

                data.shelf ??
                    "",

                data.bin ??
                    "",

                data.lot_no ??
                    "",

                data.batch_no ??
                    "",

                data.serial_no ??
                    "",

                data.manufacture_date ??
                    null,

                data.expire_date ??
                    null,

                data.receive_date ??
                    null,

                qty,

                Number(
                    data.unit_weight ??
                    0
                ),

                Number(
                    data.total_weight ??
                    0
                ),

                reservedQty,

                availableQty,

                damageQty,

                holdQty,

                onwayQty,

                unitCost,

                totalCost,

                data.remark ??
                    ""

            ]);


        return result;

    }


    // ======================================================
    // RECEIVE STOCK
    // ======================================================

    async receive(
        productCode,
        qty,
        options = {}
    ) {

        const code =
            String(
                productCode ??
                ""
            ).trim();


        const receiveQty =
            Number(qty);


        if (!code) {

            throw new Error(
                "Product Code is required"
            );

        }


        if (
            !Number.isFinite(
                receiveQty
            ) ||
            receiveQty <= 0
        ) {

            throw new Error(
                "Receive quantity must be greater than 0"
            );

        }


        const productName =
            String(
                options.product_name ??
                ""
            ).trim();


        if (!productName) {

            throw new Error(
                "Product Name is required"
            );

        }


        const unitCost =
            Number(
                options.unit_cost ??
                0
            );


        const totalCost =
            Number(
                options.total_cost ??
                (
                    receiveQty *
                    unitCost
                )
            );


        if (
            !Number.isFinite(
                unitCost
            ) ||
            unitCost < 0
        ) {

            throw new Error(
                "Receive unit cost is invalid"
            );

        }


        if (
            !Number.isFinite(
                totalCost
            ) ||
            totalCost < 0
        ) {

            throw new Error(
                "Receive total cost is invalid"
            );

        }


        // ==================================================
        // FIND EXISTING STOCK
        // ==================================================

        let stock =
            await this.getByProduct(
                code
            );


        // ==================================================
        // CREATE NEW STOCK
        // ==================================================

        if (!stock) {

            await this.create({

                product_code:
                    code,

                product_name:
                    productName,

                warehouse_id:
                    options.warehouse_id ??
                    null,

                location:
                    options.location ??
                    "",

                rack:
                    options.rack ??
                    "",

                shelf:
                    options.shelf ??
                    "",

                bin:
                    options.bin ??
                    "",

                lot_no:
                    options.lot_no ??
                    "",

                batch_no:
                    options.batch_no ??
                    "",

                serial_no:
                    options.serial_no ??
                    "",

                manufacture_date:
                    options.manufacture_date ??
                    null,

                expire_date:
                    options.expire_date ??
                    null,

                receive_date:
                    options.receive_date ??
                    null,

                qty:
                    receiveQty,

                reserved_qty:
                    0,

                damage_qty:
                    Number(
                        options.damage_qty ??
                        0
                    ),

                hold_qty:
                    Number(
                        options.hold_qty ??
                        0
                    ),

                onway_qty:
                    Number(
                        options.onway_qty ??
                        0
                    ),

                unit_cost:
                    unitCost,

                total_cost:
                    totalCost,

                remark:
                    options.remark ??
                    "Receive Stock"

            });


            stock =
                await this.getByProduct(
                    code
                );


            if (!stock) {

                throw new Error(
                    "Failed to create stock"
                );

            }


            // ==================================================
            // MOVEMENT
            // ==================================================

            await run(`

                INSERT INTO stock_movements (

                    movement_no,

                    product_code,

                    product_name,

                    stock_id,

                    reference_type,

                    reference_no,

                    movement_type,

                    warehouse_to,

                    location_to,

                    qty,

                    before_qty,

                    after_qty,

                    unit_cost,

                    total_cost,

                    lot_no,

                    batch_no,

                    serial_no,

                    remark,

                    created_by,

                    created_at

                )

                VALUES (

                    ?,?,?,?,

                    ?,?,?,?,

                    ?,?,

                    ?,?,?,?,?,?,

                    ?,?,?,?,

                    ?,?,

                    CURRENT_TIMESTAMP

                )

            `, [

                options.movement_no ??
                    null,

                code,

                productName,

                stock.id,

                options.reference_type ??
                    "IMPORT",

                options.reference_no ??
                    "",

                "RECEIVE",

                options.warehouse_id ??
                    stock.warehouse_id ??
                    null,

                options.location ??
                    stock.location ??
                    "",

                receiveQty,

                0,

                receiveQty,

                unitCost,

                totalCost,

                options.lot_no ??
                    stock.lot_no ??
                    "",

                options.batch_no ??
                    stock.batch_no ??
                    "",

                options.serial_no ??
                    stock.serial_no ??
                    "",

                options.remark ??
                    "Receive Stock",

                options.created_by ??
                    ""

            ]);


            return await this.getByProduct(
                code
            );

        }


        // ==================================================
        // EXISTING STOCK
        // ==================================================

        const beforeQty =
            Number(
                stock.qty ??
                0
            );


        const reservedQty =
            Number(
                stock.reserved_qty ??
                0
            );


        const afterQty =
            beforeQty +
            receiveQty;


        const availableQty =
            afterQty -
            reservedQty;


        if (
            availableQty < 0
        ) {

            throw new Error(
                "Available stock cannot be negative"
            );

        }


        // ==================================================
        // UPDATE STOCK
        // ==================================================

        await run(`

            UPDATE stock

            SET

                qty = ?,

                available_qty = ?,

                product_name = ?,

                unit_cost = ?,

                total_cost =
                    total_cost + ?,

                warehouse_id =
                    COALESCE(
                        ?,
                        warehouse_id
                    ),

                location =
                    COALESCE(
                        ?,
                        location
                    ),

                rack =
                    COALESCE(
                        ?,
                        rack
                    ),

                shelf =
                    COALESCE(
                        ?,
                        shelf
                    ),

                bin =
                    COALESCE(
                        ?,
                        bin
                    ),

                lot_no =
                    COALESCE(
                        ?,
                        lot_no
                    ),

                batch_no =
                    COALESCE(
                        ?,
                        batch_no
                    ),

                serial_no =
                    COALESCE(
                        ?,
                        serial_no
                    ),

                manufacture_date =
                    COALESCE(
                        ?,
                        manufacture_date
                    ),

                expire_date =
                    COALESCE(
                        ?,
                        expire_date
                    ),

                receive_date =
                    COALESCE(
                        ?,
                        receive_date
                    ),

                last_in =
                    CURRENT_TIMESTAMP,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = ?

        `, [

            afterQty,

            availableQty,

            productName,

            unitCost,

            totalCost,

            options.warehouse_id ??
                null,

            options.location ??
                null,

            options.rack ??
                null,

            options.shelf ??
                null,

            options.bin ??
                null,

            options.lot_no ??
                null,

            options.batch_no ??
                null,

            options.serial_no ??
                null,

            options.manufacture_date ??
                null,

            options.expire_date ??
                null,

            options.receive_date ??
                null,

            stock.id

        ]);


        // ==================================================
        // MOVEMENT
        // ==================================================

        await run(`

            INSERT INTO stock_movements (

                movement_no,

                product_code,

                product_name,

                stock_id,

                reference_type,

                reference_no,

                movement_type,

                warehouse_to,

                location_to,

                qty,

                before_qty,

                after_qty,

                unit_cost,

                total_cost,

                lot_no,

                batch_no,

                serial_no,

                remark,

                created_by,

                created_at

            )

            VALUES (

                ?,?,?,?,

                ?,?,?,?,

                ?,?,

                ?,?,?,?,?,?,

                ?,?,?,?,

                ?,?,

                CURRENT_TIMESTAMP

            )

        `, [

            options.movement_no ??
                null,

            code,

            productName,

            stock.id,

            options.reference_type ??
                "IMPORT",

            options.reference_no ??
                "",

            "RECEIVE",

            options.warehouse_id ??
                stock.warehouse_id ??
                null,

            options.location ??
                stock.location ??
                "",

            receiveQty,

            beforeQty,

            afterQty,

            unitCost,

            totalCost,

            options.lot_no ??
                stock.lot_no ??
                "",

            options.batch_no ??
                stock.batch_no ??
                "",

            options.serial_no ??
                stock.serial_no ??
                "",

            options.remark ??
                "Receive Stock",

            options.created_by ??
                ""

        ]);


        return await this.getByProduct(
            code
        );

    }


    // ======================================================
    // REVERSE RECEIVE STOCK
    // ======================================================

    async reverseReceive(
        productCode,
        qty,
        options = {}
    ) {

        const code =
            String(
                productCode ??
                ""
            ).trim();


        const reverseQty =
            Number(qty);


        if (!code) {

            throw new Error(
                "Product Code is required"
            );

        }


        if (
            !Number.isFinite(
                reverseQty
            ) ||
            reverseQty <= 0
        ) {

            throw new Error(
                "Reverse quantity must be greater than 0"
            );

        }


        const stock =
            await this.getByProduct(
                code
            );


        if (!stock) {

            throw new Error(
                "Stock not found"
            );

        }


        const beforeQty =
            Number(
                stock.qty ??
                0
            );


        const reservedQty =
            Number(
                stock.reserved_qty ??
                0
            );


        if (
            beforeQty <
            reverseQty
        ) {

            throw new Error(

                `Cannot reverse stock. Current stock: ${beforeQty}, Requested: ${reverseQty}`

            );

        }


        const afterQty =
            beforeQty -
            reverseQty;


        const availableQty =
            afterQty -
            reservedQty;


        if (
            availableQty < 0
        ) {

            throw new Error(
                "Cannot reverse stock because reserved stock would exceed available stock"
            );

        }


        const unitCost =
            Number(
                options.unit_cost ??
                stock.unit_cost ??
                0
            );


        const totalCost =
            Number(
                options.total_cost ??
                (
                    reverseQty *
                    unitCost
                )
            );


        await run(`

            UPDATE stock

            SET

                qty = ?,

                available_qty = ?,

                total_cost =

                    CASE

                        WHEN total_cost >= ?
                        THEN total_cost - ?

                        ELSE 0

                    END,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = ?

        `, [

            afterQty,

            availableQty,

            totalCost,

            totalCost,

            stock.id

        ]);


        await run(`

            INSERT INTO stock_movements (

                movement_no,

                product_code,

                product_name,

                stock_id,

                reference_type,

                reference_no,

                movement_type,

                warehouse_from,

                location_from,

                qty,

                before_qty,

                after_qty,

                unit_cost,

                total_cost,

                lot_no,

                batch_no,

                serial_no,

                remark,

                created_by,

                created_at

            )

            VALUES (

                ?,?,?,?,

                ?,?,?,?,

                ?,?,

                ?,?,?,?,?,?,

                ?,?,?,?,

                ?,?,

                CURRENT_TIMESTAMP

            )

        `, [

            options.movement_no ??
                null,

            code,

            stock.product_name ??
                "",

            stock.id,

            options.reference_type ??
                "IMPORT_REVERSE",

            options.reference_no ??
                "",

            "REVERSE_RECEIVE",

            options.warehouse_id ??
                stock.warehouse_id ??
                null,

            options.location ??
                stock.location ??
                "",

            reverseQty,

            beforeQty,

            afterQty,

            unitCost,

            totalCost,

            options.lot_no ??
                stock.lot_no ??
                "",

            options.batch_no ??
                stock.batch_no ??
                "",

            options.serial_no ??
                stock.serial_no ??
                "",

            options.remark ??
                "Reverse Receive Stock",

            options.created_by ??
                ""

        ]);


        return await this.getByProduct(
            code
        );

    }


    // ======================================================
    // ISSUE STOCK
    // ======================================================

    async issue(
        productCode,
        qty,
        options = {}
    ) {

        const code =
            String(
                productCode ??
                ""
            ).trim();


        const issueQty =
            Number(qty);


        if (!code) {

            throw new Error(
                "Product Code is required"
            );

        }


        if (
            !Number.isFinite(
                issueQty
            ) ||
            issueQty <= 0
        ) {

            throw new Error(
                "Issue quantity must be greater than 0"
            );

        }


        const stock =
            await this.getByProduct(
                code
            );


        if (!stock) {

            throw new Error(
                "Stock not found"
            );

        }


        const availableQty =
            Number(
                stock.available_qty ??
                0
            );


        if (
            availableQty <
            issueQty
        ) {

            throw new Error(

                `Stock not enough. Available: ${availableQty}, Requested: ${issueQty}`

            );

        }


        const beforeQty =
            Number(
                stock.qty ??
                0
            );


        const reservedQty =
            Number(
                stock.reserved_qty ??
                0
            );


        const afterQty =
            beforeQty -
            issueQty;


        const newAvailableQty =
            afterQty -
            reservedQty;


        if (
            newAvailableQty < 0
        ) {

            throw new Error(
                "Available stock cannot be negative"
            );

        }


        const unitCost =
            Number(
                options.unit_cost ??
                stock.unit_cost ??
                0
            );


        const totalCost =
            Number(
                options.total_cost ??
                (
                    issueQty *
                    unitCost
                )
            );


        if (
            !Number.isFinite(
                unitCost
            ) ||
            unitCost < 0
        ) {

            throw new Error(
                "Issue unit cost is invalid"
            );

        }


        if (
            !Number.isFinite(
                totalCost
            ) ||
            totalCost < 0
        ) {

            throw new Error(
                "Issue total cost is invalid"
            );

        }


        // ==================================================
        // UPDATE STOCK
        // ==================================================

        await run(`

            UPDATE stock

            SET

                qty = ?,

                available_qty = ?,

                total_cost =

                    CASE

                        WHEN total_cost >= ?
                        THEN total_cost - ?

                        ELSE 0

                    END,

                last_out =
                    CURRENT_TIMESTAMP,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = ?

        `, [

            afterQty,

            newAvailableQty,

            totalCost,

            totalCost,

            stock.id

        ]);


        // ==================================================
        // MOVEMENT
        // ==================================================

        await run(`

            INSERT INTO stock_movements (

                movement_no,

                product_code,

                product_name,

                stock_id,

                reference_type,

                reference_no,

                movement_type,

                warehouse_from,

                location_from,

                qty,

                before_qty,

                after_qty,

                unit_cost,

                total_cost,

                lot_no,

                batch_no,

                serial_no,

                remark,

                created_by,

                created_at

            )

            VALUES (

                ?,?,?,?,

                ?,?,?,?,

                ?,?,

                ?,?,?,?,?,?,

                ?,?,?,?,

                ?,?,

                CURRENT_TIMESTAMP

            )

        `, [

            options.movement_no ??
                null,

            code,

            stock.product_name ??
                "",

            stock.id,

            options.reference_type ??
                "EXPORT",

            options.reference_no ??
                "",

            "ISSUE",

            options.warehouse_id ??
                stock.warehouse_id ??
                null,

            options.location ??
                stock.location ??
                "",

            issueQty,

            beforeQty,

            afterQty,

            unitCost,

            totalCost,

            options.lot_no ??
                stock.lot_no ??
                "",

            options.batch_no ??
                stock.batch_no ??
                "",

            options.serial_no ??
                stock.serial_no ??
                "",

            options.remark ??
                "Issue Stock",

            options.created_by ??
                ""

        ]);


        return await this.getByProduct(
            code
        );

    }


    // ======================================================
    // REVERSE ISSUE STOCK
    // ======================================================

    async reverseIssue(
        productCode,
        qty,
        options = {}
    ) {

        const code =
            String(
                productCode ??
                ""
            ).trim();


        const reverseQty =
            Number(qty);


        if (!code) {

            throw new Error(
                "Product Code is required"
            );

        }


        if (
            !Number.isFinite(
                reverseQty
            ) ||
            reverseQty <= 0
        ) {

            throw new Error(
                "Reverse issue quantity must be greater than 0"
            );

        }


        const stock =
            await this.getByProduct(
                code
            );


        if (!stock) {

            throw new Error(
                "Stock not found"
            );

        }


        const beforeQty =
            Number(
                stock.qty ??
                0
            );


        const reservedQty =
            Number(
                stock.reserved_qty ??
                0
            );


        const afterQty =
            beforeQty +
            reverseQty;


        const availableQty =
            afterQty -
            reservedQty;


        if (
            availableQty < 0
        ) {

            throw new Error(
                "Available stock cannot be negative"
            );

        }


        const unitCost =
            Number(
                options.unit_cost ??
                stock.unit_cost ??
                0
            );


        const totalCost =
            Number(
                options.total_cost ??
                (
                    reverseQty *
                    unitCost
                )
            );


        if (
            !Number.isFinite(
                unitCost
            ) ||
            unitCost < 0
        ) {

            throw new Error(
                "Reverse issue unit cost is invalid"
            );

        }


        if (
            !Number.isFinite(
                totalCost
            ) ||
            totalCost < 0
        ) {

            throw new Error(
                "Reverse issue total cost is invalid"
            );

        }


        // ==================================================
        // UPDATE STOCK
        // ==================================================

        await run(`

            UPDATE stock

            SET

                qty = ?,

                available_qty = ?,

                total_cost =
                    total_cost + ?,

                updated_at =
                    CURRENT_TIMESTAMP

            WHERE id = ?

        `, [

            afterQty,

            availableQty,

            totalCost,

            stock.id

        ]);


        // ==================================================
        // MOVEMENT
        // ==================================================

        await run(`

            INSERT INTO stock_movements (

                movement_no,

                product_code,

                product_name,

                stock_id,

                reference_type,

                reference_no,

                movement_type,

                warehouse_to,

                location_to,

                qty,

                before_qty,

                after_qty,

                unit_cost,

                total_cost,

                lot_no,

                batch_no,

                serial_no,

                remark,

                created_by,

                created_at

            )

            VALUES (

                ?,?,?,?,

                ?,?,?,?,

                ?,?,

                ?,?,?,?,?,?,

                ?,?,?,?,

                ?,?,

                CURRENT_TIMESTAMP

            )

        `, [

            options.movement_no ??
                null,

            code,

            stock.product_name ??
                "",

            stock.id,

            options.reference_type ??
                "EXPORT_REVERSE",

            options.reference_no ??
                "",

            "REVERSE_ISSUE",

            options.warehouse_id ??
                stock.warehouse_id ??
                null,

            options.location ??
                stock.location ??
                "",

            reverseQty,

            beforeQty,

            afterQty,

            unitCost,

            totalCost,

            options.lot_no ??
                stock.lot_no ??
                "",

            options.batch_no ??
                stock.batch_no ??
                "",

            options.serial_no ??
                stock.serial_no ??
                "",

            options.remark ??
                "Reverse Issue Stock",

            options.created_by ??
                ""

        ]);


        return await this.getByProduct(
            code
        );

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports =
    new StockService();