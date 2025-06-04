const express = require("express");
const router = express.Router();

const cartController = require("../controllers/cartController");

const { authenticate } = require("../middlewares/auth");

// 장바구니 등록
router.post("/register", authenticate, cartController.cartRegister);

// 장바구니 조회 (사용자 id)
router.get("/myCart", authenticate, cartController.getMyCartList);

// 장바구니 상품 삭제
router.delete("/:id", authenticate, cartController.deleteCartItem);

module.exports = router;
