const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// 회원가입
router.post("/register", userController.userRegister);

// 중복확인 (이메일)
router.post("/check/email", userController.emailCheck);

// 중복확인 (휴대폰 번호)
router.post("/check/phone", userController.phoneCheck);

module.exports = router;
