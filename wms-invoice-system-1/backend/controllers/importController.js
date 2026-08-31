const service =
    require("../services/importService");


// ==========================================
// GET ALL
// ==========================================

exports.getAll = async (req, res) => {

    try {

        const data =
            await service.getAll();

        return res.json({

            success: true,

            total:
                data.length,

            data

        });

    } catch (err) {

        console.error(
            "Import getAll error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};


// ==========================================
// GET BY ID
// ==========================================

exports.getById = async (req, res) => {

    try {

        const data =
            await service.getById(
                req.params.id
            );

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

    } catch (err) {

        console.error(
            "Import getById error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};


// ==========================================
// GET BY INVOICE
// ==========================================

exports.getByInvoice = async (req, res) => {

    try {

        const invoiceNo =
            req.params.invoiceNo;

        const data =
            await service.findByInvoice(
                invoiceNo
            );


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Import invoice not found",

                data: []

            });

        }


        return res.json({

            success: true,

            total:
                data.length,

            data

        });

    } catch (err) {

        console.error(
            "Import getByInvoice error:",
            err
        );

        return res.status(500).json({

            success: false,

            message:
                err.message

        });

    }

};


// ==========================================
// CREATE
// ==========================================

exports.create = async (req, res) => {

    try {

        const body = {
            ...req.body
        };


        // --------------------------------------
        // FILES
        // --------------------------------------

        if (req.files) {

            Object.keys(req.files)
                .forEach((key) => {

                    if (
                        req.files[key] &&
                        req.files[key].length
                    ) {

                        body[key] =
                            req.files[key][0]
                                .filename;

                    }

                });

        }


        const result =
            await service.create(
                body
            );


        return res.status(201).json({

            success: true,

            message:
                "Import created",

            data:
                result

        });

    } catch (err) {

        console.error(
            "Import create error:",
            err
        );


        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};


// ==========================================
// UPDATE
// ==========================================

exports.update = async (req, res) => {

    try {

        const id =
            req.params.id;


        // --------------------------------------
        // CHECK EXISTING
        // --------------------------------------

        const old =
            await service.getById(id);


        if (!old) {

            return res.status(404).json({

                success: false,

                message:
                    "Import not found"

            });

        }


        // --------------------------------------
        // KEEP OLD DATA
        // --------------------------------------

        const body = {

            ...old,

            ...req.body

        };


        // --------------------------------------
        // NEW FILES
        // --------------------------------------

        if (req.files) {

            Object.keys(req.files)
                .forEach((key) => {

                    if (
                        req.files[key] &&
                        req.files[key].length
                    ) {

                        body[key] =
                            req.files[key][0]
                                .filename;

                    }

                });

        }


        // --------------------------------------
        // UPDATE SERVICE
        // --------------------------------------

        const result =
            await service.update(
                id,
                body
            );


        return res.json({

            success: true,

            message:
                "Import updated",

            data:
                result

        });

    } catch (err) {

        console.error(
            "Import update error:",
            err
        );


        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};


// ==========================================
// DELETE ONE FILE
//
// DELETE /api/imports/:id/file/:field
//
// ตัวอย่าง:
// DELETE /api/imports/15/file/invoice_file
//
// ลบเฉพาะไฟล์
// ไม่ลบ Import
// ไม่กระทบ Stock
// ==========================================

exports.deleteFile = async (req, res) => {

    try {

        const id =
            req.params.id;

        const field =
            req.params.field;


        const result =
            await service.deleteFile(
                id,
                field
            );


        return res.json({

            success: true,

            message:
                "Import file deleted",

            data:
                result

        });

    } catch (err) {

        console.error(
            "Import deleteFile error:",
            err
        );


        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};


// ==========================================
// DELETE IMPORT
// ==========================================

exports.delete = async (req, res) => {

    try {

        const result =
            await service.delete(
                req.params.id
            );


        return res.json({

            success: true,

            message:
                "Import deleted",

            data:
                result

        });

    } catch (err) {

        console.error(
            "Import delete error:",
            err
        );


        return res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};