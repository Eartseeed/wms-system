const UploadService = require("../services/uploadService");

class UploadController {

    async upload(req, res) {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "No file uploaded"

                });

            }

            const result = await UploadService.save(

                req.file,

                req.body.user_id || null

            );

            res.status(201).json({

                success: true,

                message: "Upload successful",

                file: req.file,

                data: result

            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

    async getAll(req, res) {

        try {

            const data = await UploadService.getAll();

            res.json({

                success: true,

                total: data.length,

                data

            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

    async delete(req, res) {

        try {

            await UploadService.remove(

                req.params.id

            );

            res.json({

                success: true,

                message: "File deleted"

            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

}

module.exports = new UploadController();