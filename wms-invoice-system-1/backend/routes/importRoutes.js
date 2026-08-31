const express = require("express");

const router = express.Router();

const ImportController =
    require("../controllers/importController");

const upload =
    require("../middleware/upload");


// =====================================================
// GET ALL IMPORT
// GET /api/imports
// =====================================================

router.get(
    "/",
    ImportController.getAll
);


// =====================================================
// GET IMPORT BY INVOICE
// GET /api/imports/invoice/:invoiceNo
//
// ต้องอยู่ก่อน /:id
// =====================================================

router.get(
    "/invoice/:invoiceNo",
    ImportController.getByInvoice
);


// =====================================================
// DELETE ONE IMPORT FILE
//
// DELETE /api/imports/:id/file/:field
//
// ตัวอย่าง:
// DELETE /api/imports/15/file/invoice_file
// =====================================================

router.delete(
    "/:id/file/:field",
    ImportController.deleteFile
);


// =====================================================
// GET IMPORT BY ID
// GET /api/imports/:id
// =====================================================

router.get(
    "/:id",
    ImportController.getById
);


// =====================================================
// UPLOAD FIELDS
// =====================================================

const importUploadFields = upload.fields([
    {
        name: "invoice_file",
        maxCount: 1
    },
    {
        name: "acdd_file",
        maxCount: 1
    },
    {
        name: "formd_file",
        maxCount: 1
    },
    {
        name: "truck_file",
        maxCount: 1
    },
    {
        name: "payment_file",
        maxCount: 1
    },
    {
        name: "fda_file",
        maxCount: 1
    },
    {
        name: "import_license_file",
        maxCount: 1
    }
]);


// =====================================================
// CREATE IMPORT
// POST /api/imports
// =====================================================

router.post(
    "/",
    importUploadFields,
    ImportController.create
);


// =====================================================
// UPDATE IMPORT
// PUT /api/imports/:id
// =====================================================

router.put(
    "/:id",
    importUploadFields,
    ImportController.update
);


// =====================================================
// DELETE IMPORT
// DELETE /api/imports/:id
// =====================================================

router.delete(
    "/:id",
    ImportController.delete
);


// =====================================================
// EXPORT
// =====================================================

module.exports = router;