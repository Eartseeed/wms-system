const CustomerService = require("../services/customerService");

class CustomerController {

    async getAll(req, res) {
        try {
            const data = await CustomerService.getAll();

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
        res.json({ success: true });
    }

    async create(req, res) {
        res.json({ success: true });
    }

    async update(req, res) {
        res.json({ success: true });
    }

    async delete(req, res) {
        res.json({ success: true });
    }

}

module.exports = new CustomerController();