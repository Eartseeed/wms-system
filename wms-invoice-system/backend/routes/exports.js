const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ExportService = require("../services/exportService");

const router = express.Router();


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(
    __dirname,
    "..",
    "uploads"
);


if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(
        uploadDir,
        {
            recursive: true
        }
    );

}


// =====================================================
// MULTER
// =====================================================

const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    uploadDir
                );

            },


        filename:
            function (
                req,
                file,
                cb
            ) {

                const ext =
                    path.extname(
                        file.originalname
                    );


                const name =
                    path.basename(
                        file.originalname,
                        ext
                    )
                    .replace(
                        /[^a-zA-Z0-9_-]/g,
                        "_"
                    );


                const filename =
                    `${Date.now()}_${name}${ext}`;


                cb(
                    null,
                    filename
                );

            }

    });


const upload =
    multer({
        storage
    });


// =====================================================
// DOCUMENT FIELDS
// =====================================================

const documentFields = [

    {
        name: "invoice_file",
        maxCount: 1
    },

    {
        name: "payment_file",
        maxCount: 1
    },

    {
        name: "formd_file",
        maxCount: 1
    },

    {
        name: "phytos_file",
        maxCount: 1
    },

    {
        name: "tax_file",
        maxCount: 1
    },

    {
        name: "export_license_file",
        maxCount: 1
    },

    {
        name: "origin_file",
        maxCount: 1
    },

    {
        name: "acdd_file",
        maxCount: 1
    }

];


// =====================================================
// HELPER
// =====================================================

function getUploadedFiles(
    files = {}
) {

    const result = {};


    documentFields.forEach(
        ({ name }) => {

            if (
                files[name] &&
                files[name][0]
            ) {

                result[name] =
                    files[name][0].filename;

            }

        }
    );


    return result;

}


// =====================================================
// RESPONSE
// =====================================================

function success(
    res,
    data,
    status = 200
) {

    return res
        .status(status)
        .json({

            success: true,

            data

        });

}


function error(
    res,
    err,
    status = 400
) {

    console.error(
        "Export API Error:",
        err
    );


    return res
        .status(status)
        .json({

            success: false,

            message:
                err.message ||
                "Export operation failed"

        });

}


// =====================================================
// GET ALL
// GET /api/exports
// =====================================================

router.get(
    "/",
    async (
        req,
        res
    ) => {

        try {

            const data =
                await ExportService.getAll();


            return success(
                res,
                data
            );

        } catch (err) {

            return error(
                res,
                err,
                500
            );

        }

    }
);


// =====================================================
// GET BY ID
// GET /api/exports/:id
// =====================================================

router.get(
    "/:id",
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return error(
                    res,
                    new Error(
                        "Invalid export ID"
                    ),
                    400
                );

            }


            const data =
                await ExportService.getById(
                    id
                );


            if (!data) {

                return error(
                    res,
                    new Error(
                        "Export invoice not found"
                    ),
                    404
                );

            }


            return success(
                res,
                data
            );

        } catch (err) {

            return error(
                res,
                err,
                500
            );

        }

    }
);


// =====================================================
// FIND BY INVOICE
// GET /api/exports/invoice/:invoiceNo
// =====================================================

router.get(
    "/invoice/:invoiceNo",
    async (
        req,
        res
    ) => {

        try {

            const invoiceNo =
                String(
                    req.params.invoiceNo ||
                    ""
                ).trim();


            if (!invoiceNo) {

                return error(
                    res,
                    new Error(
                        "Invoice No is required"
                    ),
                    400
                );

            }


            const data =
                await ExportService.findByInvoice(
                    invoiceNo
                );


            return success(
                res,
                data
            );

        } catch (err) {

            return error(
                res,
                err,
                500
            );

        }

    }
);


// =====================================================
// CREATE
// POST /api/exports
// =====================================================

router.post(
    "/",
    upload.fields(
        documentFields
    ),
    async (
        req,
        res
    ) => {

        try {

            const uploaded =
                getUploadedFiles(
                    req.files
                );


            const data = {

                ...(req.body || {}),

                ...uploaded

            };


            const result =
                await ExportService.create(
                    data
                );


            return success(
                res,
                result,
                201
            );

        } catch (err) {

            return error(
                res,
                err,
                400
            );

        }

    }
);


// =====================================================
// UPDATE
// PUT /api/exports/:id
// =====================================================

router.put(
    "/:id",
    upload.fields(
        documentFields
    ),
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return error(
                    res,
                    new Error(
                        "Invalid export ID"
                    ),
                    400
                );

            }


            const old =
                await ExportService.getById(
                    id
                );


            if (!old) {

                return error(
                    res,
                    new Error(
                        "Export invoice not found"
                    ),
                    404
                );

            }


            const uploaded =
                getUploadedFiles(
                    req.files
                );


            const data = {

                ...(req.body || {}),

                ...uploaded

            };


            const result =
                await ExportService.update(
                    id,
                    data
                );


            return success(
                res,
                result
            );

        } catch (err) {

            return error(
                res,
                err,
                400
            );

        }

    }
);


// =====================================================
// DELETE
// DELETE /api/exports/:id
// =====================================================

router.delete(
    "/:id",
    async (
        req,
        res
    ) => {

        try {

            const id =
                Number(
                    req.params.id
                );


            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {

                return error(
                    res,
                    new Error(
                        "Invalid export ID"
                    ),
                    400
                );

            }


            const result =
                await ExportService.delete(
                    id
                );


            return success(
                res,
                result
            );

        } catch (err) {

            const status =
                err.message ===
                "Export invoice not found"
                    ? 404
                    : 400;


            return error(
                res,
                err,
                status
            );

        }

    }
);


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports =
    router;