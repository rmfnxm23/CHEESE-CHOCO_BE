const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

const { authenticate } = require("../middlewares/auth");

// 등록
router.post("/create", authenticate, paymentController.payOrder);

// 토스 결제 승인 확인
router.post("/confirm", authenticate, paymentController.tossConfirm);

// 조회
router.get("/orderList", authenticate, paymentController.getOrderList);

module.exports = router;
