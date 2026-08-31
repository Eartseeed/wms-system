const AuthService = require("../services/authService");

class AuthController {

    async login(req, res) {

        try {

            const { username, password } = req.body;

            const data = await AuthService.login(
                username,
                password
            );

            res.json(data);

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

    async profile(req, res) {

        try {

            const data = await AuthService.profile();

            res.json(data);

        } catch (err) {

            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }

}

module.exports = new AuthController();