const ExportService = require("../services/exportService");

// =====================================================
// EXPORT CONTROLLER
// =====================================================

// =====================================================
// GET ALL
// GET /api/exports
// =====================================================

exports.getAll = async (req, res) => {


try {

    const data =
        await ExportService.getAll();


    return res.json({

        success: true,

        total:
            Array.isArray(data)
                ? data.length
                : 0,

        data:
            Array.isArray(data)
                ? data
                : []

    });

} catch (err) {

    console.error(
        "Export getAll error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to load exports"

    });

}

};

// =====================================================
// GET BY ID
// GET /api/exports/:id
// =====================================================

exports.getById = async (req, res) => {

try {

    const id =
        req.params.id;


    if (!id) {

        return res.status(400).json({

            success: false,

            message:
                "Export ID is required"

        });

    }


    const data =
        await ExportService.getById(
            id
        );


    if (!data) {

        return res.status(404).json({

            success: false,

            message:
                "Export not found"

        });

    }


    return res.json({

        success: true,

        data

    });

} catch (err) {

    console.error(
        "Export getById error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to load export"

    });

}


};

// =====================================================
// GET BY INVOICE
// GET /api/exports/invoice/:invoiceNo
// =====================================================

exports.getByInvoice = async (req, res) => {

try {

    const invoiceNo =
        String(
            req.params.invoiceNo || ""
        ).trim();


    if (!invoiceNo) {

        return res.status(400).json({

            success: false,

            message:
                "Invoice No is required"

        });

    }


    const data =
        await ExportService.findByInvoice(
            invoiceNo
        );


    return res.json({

        success: true,

        total:
            Array.isArray(data)
                ? data.length
                : 0,

        data:
            Array.isArray(data)
                ? data
                : []

    });

} catch (err) {

    console.error(
        "Export getByInvoice error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to load export invoice"

    });

}

};

// =====================================================
// BUILD REQUEST BODY
// =====================================================

function buildBody(req) {

const body = {
    ...req.body
};


// =================================================
// FILES
// =================================================

if (req.files) {

    Object.keys(req.files)
        .forEach((key) => {

            const file =
                req.files[key]?.[0];


            if (!file) {

                return;

            }


            body[key] =
                file.filename;

        });

}


// =================================================
// USER
// =================================================

if (req.user) {

    const userId =
        req.user.id ??
        req.user.user_id ??
        req.user.username ??
        "";


    body.created_by =
        userId;

    body.updated_by =
        userId;

}


return body;

}

// =====================================================
// CREATE
// POST /api/exports
// =====================================================

exports.create = async (req, res) => {

try {

    const body =
        buildBody(req);


    const result =
        await ExportService.create(
            body
        );


    return res.status(201).json({

        success: true,

        message:
            "Export created",

        data:
            result

    });

} catch (err) {

    console.error(
        "Export create error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to create export"

    });

}


};

// =====================================================
// UPDATE
// PUT /api/exports/:id
// =====================================================

exports.update = async (req, res) => {


try {

    const id =
        req.params.id;


    if (!id) {

        return res.status(400).json({

            success: false,

            message:
                "Export ID is required"

        });

    }


    // =================================================
    // LOAD OLD DATA
    // =================================================

    const old =
        await ExportService.getById(
            id
        );


    if (!old) {

        return res.status(404).json({

            success: false,

            message:
                "Export not found"

        });

    }


    // =================================================
    // MERGE OLD + NEW
    // =================================================

    const body = {

        ...old,

        ...req.body

    };


    // =================================================
    // USER
    // =================================================

    if (req.user) {

        body.updated_by =
            req.user.id ??
            req.user.user_id ??
            req.user.username ??
            "";

    }


    // =================================================
    // NEW FILES
    //
    // ไม่มีไฟล์ใหม่
    // → เก็บไฟล์เดิม
    //
    // มีไฟล์ใหม่
    // → ใช้ไฟล์ใหม่
    // =================================================

    if (req.files) {

        Object.keys(req.files)
            .forEach((key) => {

                const file =
                    req.files[key]?.[0];


                if (!file) {

                    return;

                }


                body[key] =
                    file.filename;

            });

    }


    // =================================================
    // UPDATE SERVICE
    // =================================================

    const result =
        await ExportService.update(

            id,

            body

        );


    return res.json({

        success: true,

        message:
            "Export updated",

        data:
            result

    });

} catch (err) {

    console.error(
        "Export update error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to update export"

    });

}


};

// =====================================================
// DELETE ONE FILE
// DELETE /api/exports/:id/file/:field
//
// ลบเฉพาะไฟล์
// ไม่ลบ Export
// ไม่ Reverse Stock
// =====================================================

exports.deleteFile = async (req, res) => {


try {

    const id =
        req.params.id;


    const field =
        String(
            req.params.field || ""
        ).trim();


    if (!id) {

        return res.status(400).json({

            success: false,

            message:
                "Export ID is required"

        });

    }


    if (!field) {

        return res.status(400).json({

            success: false,

            message:
                "File field is required"

        });

    }


    const result =
        await ExportService.deleteFile(

            id,

            field

        );


    return res.json({

        success: true,

        message:
            "Export file deleted",

        data:
            result

    });

} catch (err) {

    console.error(
        "Export deleteFile error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to delete export file"

    });

}

};

// =====================================================
// DELETE
// DELETE /api/exports/:id
// =====================================================

exports.delete = async (req, res) => {


try {

    const id =
        req.params.id;


    if (!id) {

        return res.status(400).json({

            success: false,

            message:
                "Export ID is required"

        });

    }


    const old =
        await ExportService.getById(
            id
        );


    if (!old) {

        return res.status(404).json({

            success: false,

            message:
                "Export not found"

        });

    }


    const result =
        await ExportService.delete(
            id
        );


    return res.json({

        success: true,

        message:
            "Export deleted",

        data:
            result

    });

} catch (err) {

    console.error(
        "Export delete error:",
        err
    );


    return res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Failed to delete export"

    });

}

};
