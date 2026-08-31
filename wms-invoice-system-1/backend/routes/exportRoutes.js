const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const exportController =
require("../controllers/exportController");

// ======================================================
// UPLOAD FIELDS
// ======================================================

const exportUploadFields = [


{ name: "invoice_file", maxCount: 1 },

{ name: "payment_file", maxCount: 1 },

{ name: "formd_file", maxCount: 1 },

{ name: "phytos_file", maxCount: 1 },

{ name: "tax_file", maxCount: 1 },

{ name: "export_license_file", maxCount: 1 },

{ name: "origin_file", maxCount: 1 },

{ name: "acdd_file", maxCount: 1 }

];

// ======================================================
// GET ALL EXPORT
//
// GET /api/exports
// ======================================================

router.get(


"/",

exportController.getAll


);

// ======================================================
// GET EXPORT BY INVOICE
//
// GET /api/exports/invoice/:invoiceNo
//
// IMPORTANT:
// ต้องอยู่ก่อน /:id
// ======================================================

router.get(

"/invoice/:invoiceNo",

exportController.getByInvoice


);

// ======================================================
// DELETE ONE EXPORT FILE
//
// DELETE /api/exports/:id/file/:field
//
// IMPORTANT:
// ต้องอยู่ก่อน /:id
// ======================================================

router.delete(

"/:id/file/:field",

exportController.deleteFile


);

// ======================================================
// GET EXPORT BY ID
//
// GET /api/exports/:id
// ======================================================

router.get(


"/:id",

exportController.getById


);

// ======================================================
// CREATE EXPORT
//
// POST /api/exports
// ======================================================

router.post(

"/",

upload.fields(
    exportUploadFields
),

exportController.create


);

// ======================================================
// UPDATE EXPORT
//
// PUT /api/exports/:id
// ======================================================

router.put(


"/:id",

upload.fields(
    exportUploadFields
),

exportController.update

);

// ======================================================
// DELETE EXPORT
//
// DELETE /api/exports/:id
// ======================================================

router.delete(

"/:id",

exportController.delete

);

module.exports = router;
