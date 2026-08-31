const StockService = require("../services/stockService");


class StockController {

    // =========================================================
    // GET ALL STOCK
    // =========================================================

    async getAll(req, res) {

        try {

            const data =
                await StockService.getAll();

            res.json({

                success: true,

                total: data.length,

                data

            });

        } catch (err) {

            console.error(
                "Stock getAll error:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }


    // =========================================================
    // GET STOCK BY PRODUCT
    // =========================================================

    async getByProduct(req, res) {

        try {

            const productId =
                req.params.productId;


            if (!productId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "productId is required"

                });

            }


            const data =
                await StockService.getByProduct(
                    productId
                );


            if (!data) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Stock not found"

                });

            }


            res.json({

                success: true,

                data

            });

        } catch (err) {

            console.error(
                "Stock getByProduct error:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }


    // =========================================================
    // CREATE STOCK
    // =========================================================

    async create(req, res) {

        try {

            const result =
                await StockService.create(
                    req.body
                );


            res.status(201).json({

                success: true,

                message:
                    "Stock created",

                data: result

            });

        } catch (err) {

            console.error(
                "Stock create error:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }


    // =========================================================
    // RECEIVE STOCK
    // IMPORT → RECEIVE
    // =========================================================

    async receive(req, res) {

        try {

            const {

                product_id,

                qty,

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

                unit_weight,

                total_weight,

                total_cost,

                reference_type,

                reference_no,

                movement_no,

                remark

            } = req.body;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!product_id) {

                return res.status(400).json({

                    success: false,

                    message:
                        "product_id is required"

                });

            }


            if (
                qty === undefined ||
                qty === null ||
                Number(qty) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "qty must be greater than 0"

                });

            }


            // -------------------------------------------------
            // RECEIVE
            // -------------------------------------------------

            const result =
                await StockService.receive(

                    product_id,

                    qty,

                    {

                        warehouse_id:
                            warehouse_id || null,

                        location:
                            location || "",

                        rack:
                            rack || "",

                        shelf:
                            shelf || "",

                        bin:
                            bin || "",

                        lot_no:
                            lot_no || "",

                        batch_no:
                            batch_no || "",

                        serial_no:
                            serial_no || "",

                        manufacture_date:
                            manufacture_date ||
                            null,

                        expire_date:
                            expire_date ||
                            null,

                        receive_date:
                            receive_date ||
                            null,

                        unit_weight:
                            Number(
                                unit_weight || 0
                            ),

                        total_weight:
                            Number(
                                total_weight || 0
                            ),

                        total_cost:
                            Number(
                                total_cost || 0
                            ),

                        reference_type:
                            reference_type ||
                            "IMPORT",

                        reference_no:
                            reference_no || "",

                        movement_no:
                            movement_no || null,

                        remark:
                            remark ||
                            "Receive Stock",

                        created_by:
                            req.user?.username ||
                            req.user?.id ||
                            ""

                    }

                );


            res.json({

                success: true,

                message:
                    "Receive success",

                data: result

            });

        } catch (err) {

            console.error(
                "Stock receive error:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }


    // =========================================================
    // ISSUE STOCK
    // EXPORT → ISSUE
    // =========================================================

    async issue(req, res) {

        try {

            const {

                product_id,

                qty,

                warehouse_id,

                location,

                lot_no,

                batch_no,

                serial_no,

                unit_weight,

                total_weight,

                reference_type,

                reference_no,

                movement_no,

                remark

            } = req.body;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!product_id) {

                return res.status(400).json({

                    success: false,

                    message:
                        "product_id is required"

                });

            }


            if (
                qty === undefined ||
                qty === null ||
                Number(qty) <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "qty must be greater than 0"

                });

            }


            // -------------------------------------------------
            // ISSUE
            // -------------------------------------------------

            const result =
                await StockService.issue(

                    product_id,

                    qty,

                    {

                        warehouse_id:
                            warehouse_id || null,

                        location:
                            location || "",

                        lot_no:
                            lot_no || "",

                        batch_no:
                            batch_no || "",

                        serial_no:
                            serial_no || "",

                        unit_weight:
                            Number(
                                unit_weight || 0
                            ),

                        total_weight:
                            Number(
                                total_weight || 0
                            ),

                        reference_type:
                            reference_type ||
                            "EXPORT",

                        reference_no:
                            reference_no || "",

                        movement_no:
                            movement_no || null,

                        remark:
                            remark ||
                            "Issue Stock",

                        created_by:
                            req.user?.username ||
                            req.user?.id ||
                            ""

                    }

                );


            res.json({

                success: true,

                message:
                    "Issue success",

                data: result

            });

        } catch (err) {

            console.error(
                "Stock issue error:",
                err
            );

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

}


module.exports =
    new StockController();