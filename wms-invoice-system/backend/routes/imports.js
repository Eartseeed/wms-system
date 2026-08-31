const express = require("express");

const router = express.Router();

const ImportService =
    require("../services/importService");


// ======================================================
// GET ALL IMPORTS
// GET /api/imports
// ======================================================

router.get("/", async (req, res) => {

    try {

        const data =
            await ImportService.getAll();

        return res.json({

            success: true,

            data

        });

    } catch (error) {

        console.error(
            "GET /api/imports error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to get imports"

        });

    }

});


// ======================================================
// GET IMPORT BY ID
// GET /api/imports/:id
// ======================================================

router.get("/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid import ID"

            });

        }


        const data =
            await ImportService.getById(id);


        if (!data) {

            return res.status(404).json({

                success: false,

                message:
                    "Import not found"

            });

        }


        return res.json({

            success: true,

            data

        });

    } catch (error) {

        console.error(
            "GET /api/imports/:id error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to get import"

        });

    }

});


// ======================================================
// GET IMPORT BY INVOICE
// GET /api/imports/invoice/:invoiceNo
//
// ต้องวางก่อน /:id
// ======================================================

router.get(
    "/invoice/:invoiceNo",
    async (req, res) => {

        try {

            const invoiceNo =
                String(
                    req.params.invoiceNo ||
                    ""
                ).trim();


            if (!invoiceNo) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invoice No is required"

                });

            }


            const data =
                await ImportService.findByInvoice(
                    invoiceNo
                );


            return res.json({

                success: true,

                data

            });

        } catch (error) {

            console.error(
                "GET /api/imports/invoice/:invoiceNo error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to find import"

            });

        }

    }
);


// ======================================================
// CREATE IMPORT
// POST /api/imports
// ======================================================

router.post("/", async (req, res) => {

    try {

        const data =
            await ImportService.create(
                req.body || {}
            );


        return res.status(201).json({

            success: true,

            message:
                "Import created successfully",

            data

        });

    } catch (error) {

        console.error(
            "POST /api/imports error:",
            error
        );


        const message =
            error.message ||
            "Failed to create import";


        // ----------------------------------------------
        // VALIDATION / BUSINESS ERROR
        // ----------------------------------------------

        if (
            message.includes(
                "required"
            ) ||
            message.includes(
                "greater than 0"
            ) ||
            message.includes(
                "invalid"
            ) ||
            message.includes(
                "not found"
            ) ||
            message.includes(
                "not enough"
            )
        ) {

            return res.status(400).json({

                success: false,

                message

            });

        }


        return res.status(500).json({

            success: false,

            message

        });

    }

});


// ======================================================
// UPDATE IMPORT
// PUT /api/imports/:id
// ======================================================

router.put("/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid import ID"

            });

        }


        const data =
            await ImportService.update(

                id,

                req.body || {}

            );


        return res.json({

            success: true,

            message:
                "Import updated successfully",

            data

        });

    } catch (error) {

        console.error(
            "PUT /api/imports/:id error:",
            error
        );


        const message =
            error.message ||
            "Failed to update import";


        if (
            message.includes(
                "not found"
            ) ||
            message.includes(
                "required"
            ) ||
            message.includes(
                "invalid"
            ) ||
            message.includes(
                "greater than 0"
            ) ||
            message.includes(
                "not enough"
            )
        ) {

            return res.status(400).json({

                success: false,

                message

            });

        }


        return res.status(500).json({

            success: false,

            message

        });

    }

});


// ======================================================
// DELETE IMPORT
// DELETE /api/imports/:id
// ======================================================

router.delete("/:id", async (req, res) => {

    try {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid import ID"

            });

        }


        const result =
            await ImportService.delete(id);


        return res.json({

            success: true,

            message:
                "Import deleted successfully",

            data: {

                id,

                changes:
                    result?.changes ?? 0

            }

        });

    } catch (error) {

        console.error(
            "DELETE /api/imports/:id error:",
            error
        );


        const message =
            error.message ||
            "Failed to delete import";


        if (
            message.includes(
                "not found"
            ) ||
            message.includes(
                "invalid"
            ) ||
            message.includes(
                "Cannot reverse"
            ) ||
            message.includes(
                "Stock not found"
            )
        ) {

            return res.status(400).json({

                success: false,

                message

            });

        }


        return res.status(500).json({

            success: false,

            message

        });

    }

});


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;