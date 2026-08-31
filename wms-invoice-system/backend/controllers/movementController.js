const MovementService = require("../services/movementService");

class MovementController {

    async getAll(req, res) {

        try {

            const data = await MovementService.getAll();

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

            const movement = await MovementService.getById(

                req.params.id

            );

            if (!movement) {

                return res.status(404).json({

                    success: false,

                    message: "Movement not found"

                });

            }

            res.json({

                success: true,

                data: movement

            });

        } catch (err) {

            console.error(err);

            res.status(500).json({

                success: false,

                message: err.message

            });

        }

    }

    async getByProduct(req, res) {

        try {

            const data = await MovementService.getByProduct(

                req.params.productId

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

    async create(req, res) {

        try {

            const result = await MovementService.create(req.body);

            res.status(201).json({

                success: true,

                message: "Movement created",

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

            await MovementService.delete(

                req.params.id

            );

            res.json({

                success: true,

                message: "Movement deleted"

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

module.exports = new MovementController();