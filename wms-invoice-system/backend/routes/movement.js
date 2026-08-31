const express = require("express");

const router = express.Router();

const MovementController = require("../controllers/movementController");

router.get(
    "/",
    MovementController.getAll
);

router.get(
    "/product/:productId",
    MovementController.getByProduct
);

router.get(
    "/:id",
    MovementController.getById
);

router.post(
    "/",
    MovementController.create
);

router.delete(
    "/:id",
    MovementController.delete
);

module.exports = router;