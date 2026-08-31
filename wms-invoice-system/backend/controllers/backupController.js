const BackupService = require("../services/backupService");

class BackupController {

    async create(req, res) {

        try {

            const data = await BackupService.createBackup();

            res.status(201).json({

                success: true,

                message: "Database backup completed",

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

    async getAll(req, res) {

        try {

            const data = await BackupService.getAllBackups();

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

            await BackupService.deleteBackup(

                req.params.filename

            );

            res.json({

                success: true,

                message: "Backup deleted"

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

module.exports = new BackupController();