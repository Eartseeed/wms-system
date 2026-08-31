class AuthService {

    async login(username, password) {

        return {
            success: true,
            message: "Login Success",
            token: "demo-token",
            user: {
                id: 1,
                username: username,
                name: "Administrator",
                role: "admin"
            }
        };

    }

    async profile() {

        return {
            success: true
        };

    }

}

module.exports = new AuthService();