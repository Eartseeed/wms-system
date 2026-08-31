const SupplierService = require("../services/supplierService");

class SupplierController {

    async getAll(req, res) {

        try {

            const data = await SupplierService.getAll(
                req.query.search || ""
            );

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

    async getById(req, res) {

        try {

            const data = await SupplierService.getById(
                req.params.id
            );

            if (!data) {

                return res.status(404).json({
                    success: false,
                    message: "Supplier not found"
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

    async create(req, res) {

        try {

            const result = await SupplierService.create(
                req.body
            );

            res.status(201).json({
                success: true,
                message: "Supplier created",
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

    async update(req, res) {

        try {

            const result = await SupplierService.update(
                req.params.id,
                req.body
            );

            res.json({
                success: true,
                message: "Supplier updated",
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

            await SupplierService.delete(
                req.params.id
            );

            res.json({
                success: true,
                message: "Supplier deleted"
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

module.exports = new SupplierController();