const SettingService = require("../services/settingService");

class SettingController {

    async getAll(req, res) {

        try {

            const data = await SettingService.getAll();

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

    async getByKey(req, res) {

        try {

            const data = await SettingService.getByKey(

                req.params.key

            );

            if (!data) {

                return res.status(404).json({

                    success: false,

                    message: "Setting not found"

                });

            }

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

    async save(req, res) {

        try {

            const {

                setting_key,

                setting_value,

                user_id

            } = req.body;

            const result = await SettingService.save(

                setting_key,

                setting_value,

                user_id

            );

            res.json({

                success: true,

                message: "Setting saved",

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

    async delete(req, res) {

        try {

            await SettingService.remove(

                req.params.key

            );

            res.json({

                success: true,

                message: "Setting deleted"

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

module.exports = new SettingController();