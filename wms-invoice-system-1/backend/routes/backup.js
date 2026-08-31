const express = require("express");

const router = express.Router();

const BackupController = require("../controllers/backupController");

/* ===========================================
   Backup Database
=========================================== */

router.post(

    "/",

    BackupController.create

);

/* ===========================================
   Get Backup List
=========================================== */

router.get(

    "/",

    BackupController.getAll

);

/* ===========================================
   Delete Backup
=========================================== */

router.delete(

    "/:filename",

    BackupController.delete

);

module.exports = router;