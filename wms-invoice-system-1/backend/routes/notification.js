const express = require("express");

const router = express.Router();

const NotificationController = require("../controllers/notificationController");

/* ===========================================
   All Notifications
=========================================== */

router.get(

    "/",

    NotificationController.getAll

);

/* ===========================================
   Unread Count
=========================================== */

router.get(

    "/count",

    NotificationController.unreadCount

);

/* ===========================================
   System Status
=========================================== */

router.get(

    "/system",

    NotificationController.systemStatus

);

module.exports = router;