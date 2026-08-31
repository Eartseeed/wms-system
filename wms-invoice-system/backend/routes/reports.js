const express = require("express");

const router = express.Router();

const ReportController = require("../controllers/reportController");

router.get(
    "/stock",
    ReportController.stockReport
);

router.get(
    "/movement",
    ReportController.movementReport
);

router.get(
    "/import",
    ReportController.importReport
);

router.get(
    "/export",
    ReportController.exportReport
);

router.get(
    "/inventory-value",
    ReportController.inventoryValue
);

module.exports = router;