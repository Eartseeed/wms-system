const express = require("express");

const router = express.Router();

const DashboardController = require("../controllers/dashboardController");

// ===== API เดิม =====

router.get(
    "/",
    DashboardController.dashboard
);

router.get(
    "/recent-import",
    DashboardController.recentImport
);

router.get(
    "/recent-export",
    DashboardController.recentExport
);

router.get(
    "/import-pages",
    DashboardController.importPages
);

router.get(
    "/export-pages",
    DashboardController.exportPages
);

// ===== API ใหม่ =====

router.get(
    "/summary",
    DashboardController.summary
);

router.get(
    "/low-stock",
    DashboardController.lowStock
);

router.get(
    "/recent-movements",
    DashboardController.recentMovements
);

module.exports = router;