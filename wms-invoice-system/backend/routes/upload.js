const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const UploadController = require("../controllers/uploadController");

/* ===========================================
   Upload Folder
=========================================== */

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {

    fs.mkdirSync(uploadDir, {

        recursive: true

    });

}

/* ===========================================
   Multer Storage
=========================================== */

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, uploadDir);

    },

    filename(req, file, cb) {

        const ext = path.extname(file.originalname);

        const filename =

            Date.now() +

            "_" +

            Math.round(Math.random() * 1000000) +

            ext;

        cb(null, filename);

    }

});

/* ===========================================
   Upload Config
=========================================== */

const upload = multer({

    storage,

    limits: {

        fileSize: 50 * 1024 * 1024

    }

});

/* ===========================================
   Routes
=========================================== */

router.post(

    "/",

    upload.single("file"),

    UploadController.upload

);

router.get(

    "/",

    UploadController.getAll

);

router.delete(

    "/:id",

    UploadController.delete

);

module.exports = router;