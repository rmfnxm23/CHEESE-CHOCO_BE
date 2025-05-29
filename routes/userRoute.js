const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

const { authenticate } = require("../middlewares/auth");

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

// 비밀번호 재설정 인증 코드 확인
router.post("/pwVerifyCode", userController.verifyCode);

// 비밀번호 변경
router.post("/change/pw", userController.updateUserPw);

router.get("/me", authenticate, userController.getMe);

module.exports = router;
