const UserService = require("../services/userService");

class UserController {

    async getAll(req, res) {

        try {

            const data = await UserService.getAll();

            res.json({
                success: true,
                total: data.length,
                data
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

    async getById(req, res) {

        try {

            const data = await UserService.getById(req.params.id);

            if (!data) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }

            res.json({
                success: true,
                data
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

    async create(req, res) {

        try {

            const data = await UserService.create(req.body);

            res.json({
                success: true,
                data
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

    async update(req, res) {

        try {

            const data = await UserService.update(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                data
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

    async delete(req, res) {

        try {

            await UserService.remove(req.params.id);

            res.json({
                success: true,
                message: "User deleted"
            });

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

}

module.exports = new UserController();