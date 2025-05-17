const { User } = require("../models");
const bcrypt = require("bcrypt");

// 회원가입
const userRegister = async (req, res) => {
  try {
    let { email, password, name, phone } = req.body;

    if (!email || !name || !phone) {
      return res.status(400).json({ error: "필수 항목이 누락되었습니다." });
    }

    let loginType = ""; // 로그인 타입
    let hashPassword = ""; // 비밀번호 처리
    const userType = "user"; // 사용자 or 관리자

    // loginType 따른 비밀번호 처리
    if (password) {
      loginType = "local"; // 로컬 회원가입
      // 비밀번호 암호화
      hashPassword = await bcrypt.hash(password, 10); // hash: 비동기식(await 사용), hashSync: 동기식
    } else {
      loginType = "naver"; // 소셜 회원가입
    }

    // 소셜 로그인일 경우 회원가입 시 이메일 중복 확인
    if (loginType === "naver") {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "이미 사용 중인 이메일입니다." });
      }
    }

    await User.create({
      email,
      password: hashPassword,
      name,
      phone,
      loginType,
      userType,
    });
    res.status(201).json({ message: "회원가입 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  }
};

// 중복확인 (이메일)
const emailCheck = async (req, res) => {
  try {
    const email = req.body.email;

    const existData = await User.findOne({ where: { email } });

    if (existData) {
      return res
        .status(200)
        .json({ exist: true, message: "이미 사용된 이메일입니다." });
    } else {
      return res
        .status(200)
        .json({ exist: false, message: "사용가능한 이메일입니다." });
    }
  } catch (err) {
    console.error(err);
  }
};

// 중복확인 (휴대폰 번호)
const phoneCheck = async (req, res) => {
  try {
    const phone = req.body.phone;

    const existData = await User.findOne({ where: { phone } });

    if (existData) {
      return res
        .status(200)
        .json({ exist: true, message: "이미 사용된 번호입니다." });
    } else {
      return res
        .status(200)
        .json({ exist: false, message: "사용가능한 번호입니다." });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = { userRegister, emailCheck, phoneCheck };
