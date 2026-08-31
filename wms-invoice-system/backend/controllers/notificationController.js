const NotificationService = require("../services/notificationService");

class NotificationController {

    async getAll(req, res) {

        try {

            const data = await NotificationService.getAll();

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

    async unreadCount(req, res) {

        try {

            const data = await NotificationService.unreadCount();

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

    async systemStatus(req, res) {

        try {

            const data = await NotificationService.systemStatus();

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

}

module.exports = new NotificationController();