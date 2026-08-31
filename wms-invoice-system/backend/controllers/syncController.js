const SyncService = require("../services/syncService");

class SyncController {

    async getLastSync(req, res) {

        try {

            const data = await SyncService.getLastSync();

            res.json({

                success: true,

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

    async getChanges(req, res) {

        try {

            const lastSync = req.query.lastSync;

            if (!lastSync) {

                return res.status(400).json({

                    success: false,

                    message: "lastSync is required"

                });

            }

            const data = await SyncService.getChanges(lastSync);

            res.json({

                success: true,

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

    async sync(req, res) {

        try {

            const deviceName = req.body.device_name || "Unknown Device";

            const result = await SyncService.saveSyncLog(deviceName);

            res.json({

                success: true,

                message: "Sync completed",

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

    async history(req, res) {

        try {

            const data = await SyncService.getHistory();

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

}

module.exports = new SyncController();