const express = require("express");

const router = express.Router();

const SettingController = require("../controllers/settingsController");

router.get(
    "/",
    SettingController.getAll
);

router.get(
    "/:key",
    SettingController.getByKey
);

router.post(
    "/",
    SettingController.save
);

router.delete(
    "/:key",
    SettingController.delete
);

module.exports = router;