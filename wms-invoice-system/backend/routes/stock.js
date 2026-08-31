const express = require("express");

const router = express.Router();

const StockController = require("../controllers/stockController");

router.get(
    "/",
    StockController.getAll
);

router.get(
    "/product/:productId",
    StockController.getByProduct
);

router.post(
    "/",
    StockController.create
);

router.post(
    "/receive",
    StockController.receive
);

router.post(
    "/issue",
    StockController.issue
);

module.exports = router;