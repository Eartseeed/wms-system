const express = require("express");

const router = express.Router();

const SupplierController = require("../controllers/supplierController");

// ======================
// Search + List
// ======================
router.get(
    "/",
    SupplierController.getAll
);

// ======================
// Get By ID
// ======================
router.get(
    "/:id",
    SupplierController.getById
);

// ======================
// Create
// ======================
router.post(
    "/",
    SupplierController.create
);

// ======================
// Update
// ======================
router.put(
    "/:id",
    SupplierController.update
);

// ======================
// Delete
// ======================
router.delete(
    "/:id",
    SupplierController.delete
);

module.exports = router;