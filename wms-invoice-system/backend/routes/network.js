const express = require("express");

const router = express.Router();

const NetworkController = require("../controllers/networkController");

/* ===========================================
   Network Information
=========================================== */

router.get(

    "/info",

    NetworkController.info

);

/* ===========================================
   Server Status
=========================================== */

router.get(

    "/status",

    NetworkController.status

);

/* ===========================================
   Ping Server
=========================================== */

router.get(

    "/ping",

    NetworkController.ping

);

module.exports = router;