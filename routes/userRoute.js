const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// 회원가입
router.post("/register", userController.userRegister);

// 중복확인 (이메일)
router.post("/check/email", userController.emailCheck);

// 중복확인 (휴대폰 번호)
router.post("/check/phone", userController.phoneCheck);

// 로그인
router.post("/login", userController.userLogin);

// 아이디 찾기
router.post("/find/id", userController.getUserId);

// 비밀번호 찾기
router.post("/find/pw", userController.getUserPw);

module.exports = router;
