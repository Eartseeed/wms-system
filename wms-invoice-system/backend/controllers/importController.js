const service = require("../services/importService");


// ==========================================
// GET ALL
// ==========================================
exports.getAll = async (req, res) => {

    try {

        const data = await service.getAll();

        res.json({
            success: true,
            total: data.length,
            data: data
        });

    } catch (err) {

        console.error("Import getAll error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// ==========================================
// GET BY ID
// ==========================================
exports.getById = async (req, res) => {

    try {

        const data = await service.getById(req.params.id);

        if (!data) {

            return res.status(404).json({
                success: false,
                message: "Import not found"
            });

        }

        res.json({
            success: true,
            data
        });

    } catch (err) {

        console.error("Import getById error:", err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};


// ==========================================
// GET BY INVOICE
// ==========================================
exports.getByInvoice = async (req, res) => {

    try {

        const invoiceNo = req.params.invoiceNo;

        const data = await service.findByInvoice(invoiceNo);

        if (!data) {

            return res.status(404).json({
                success: false,
                message: "Import invoice not found"
            });

        }

        res.json({
            success: true,
            data
        });

    } catch (err) {

        console.error("Import getByInvoice error:", err);

        res.status(500).json({
            success: false,
            message: err.message
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


        // รับไฟล์
        if (req.files) {

            Object.keys(req.files).forEach((key) => {

                if (req.files[key]?.length) {

                    body[key] = req.files[key][0].filename;

                }

            });

        }


        const result = await service.create(body);


        res.status(201).json({

            success: true,
            message: "Import created",
            data: result

        });

    } catch (err) {

        console.error("Import create error:", err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};


// ==========================================
// UPDATE
// ==========================================
exports.update = async (req, res) => {

    try {

        const old = await service.getById(req.params.id);


        if (!old) {

            return res.status(404).json({

                success: false,
                message: "Import not found"

            });

        }


        const body = {

            ...old,
            ...req.body

        };


        // ถ้ามีไฟล์ใหม่ ให้ใช้ไฟล์ใหม่
        if (req.files) {

            Object.keys(req.files).forEach((key) => {

                if (req.files[key]?.length) {

                    body[key] = req.files[key][0].filename;

                }

            });

        }


        const result = await service.update(
            req.params.id,
            body
        );


        res.json({

            success: true,
            message: "Import updated",
            data: result

        });

    } catch (err) {

        console.error("Import update error:", err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};


// ==========================================
// DELETE
// ==========================================
exports.delete = async (req, res) => {

    try {

        const result = await service.delete(
            req.params.id
        );


        res.json({

            success: true,
            message: "Import deleted",
            data: result

        });

    } catch (err) {

        console.error("Import delete error:", err);

        res.status(500).json({

            success: false,
            message: err.message

        });

    }

};