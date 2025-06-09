const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

const { authenticate } = require("../middlewares/auth");

router.post("/confirm", authenticate, paymentController.tossConfirm);

router.get("/orderList", authenticate, paymentController.getOrderList);

module.exports = router;
