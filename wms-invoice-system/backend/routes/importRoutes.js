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
//
// สำคัญ:
// ต้องอยู่ก่อน /:id
//
// GET /api/imports/invoice/:invoiceNo
// =====================================================

router.get(
    "/invoice/:invoiceNo",
    ImportController.getByInvoice
);


// =====================================================
// GET IMPORT BY ID
//
// GET /api/imports/:id
// =====================================================

router.get(
    "/:id",
    ImportController.getById
);


// =====================================================
// CREATE IMPORT
//
// POST /api/imports
//
// รองรับเอกสาร:
// - invoice_file
// - acdd_file
// - formd_file
// - truck_file
// - payment_file
// - fda_file
// - import_license_file
// =====================================================

router.post(
    "/",
    upload.fields([
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
    ]),
    ImportController.create
);


// =====================================================
// UPDATE IMPORT
//
// PUT /api/imports/:id
//
// ถ้ามีไฟล์ใหม่:
// ใช้ไฟล์ใหม่
//
// ถ้าไม่มีไฟล์ใหม่:
// Controller จะรักษาไฟล์เดิมไว้
// =====================================================

router.put(
    "/:id",
    upload.fields([
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
    ]),
    ImportController.update
);


// =====================================================
// DELETE IMPORT
//
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