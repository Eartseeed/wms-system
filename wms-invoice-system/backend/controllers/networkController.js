const NetworkService = require("../services/networkService");

class NetworkController {

    async info(req, res) {

        try {

            const data = await NetworkService.getNetworkInfo();

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

    async status(req, res) {

        try {

            const data = await NetworkService.getServerStatus();

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

    async ping(req, res) {

        try {

            const data = await NetworkService.ping();

            res.json(data);

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

}

module.exports = new NetworkController();