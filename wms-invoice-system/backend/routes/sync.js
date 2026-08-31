const express = require("express");

const router = express.Router();

const SyncController = require("../controllers/syncController");

/* ===========================================
   Last Sync
=========================================== */

router.get(

    "/last",

    SyncController.getLastSync

);

/* ===========================================
   Sync History
=========================================== */

router.get(

    "/history",

    SyncController.history

);

/* ===========================================
   Get Changes
=========================================== */

router.get(

    "/changes",

    SyncController.getChanges

);

/* ===========================================
   Sync Now
=========================================== */

router.post(

    "/",

    SyncController.sync

);

module.exports = router;