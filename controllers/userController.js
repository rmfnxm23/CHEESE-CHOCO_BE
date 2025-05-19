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

// 로그인
const userLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(201).json({
        success: false,
        message: "아이디 또는 비밀번호를 입력해주세요.",
      });
    }

    const userData = await User.findOne({ where: { email } });

    if (!userData) {
      return res
        .status(201)
        .json({ success: false, message: "해당 유저가 존재하지 않습니다." });
    }

    const matchedPass = await bcrypt.compare(password, userData.password); // 입력한 비밀번호화 DB에 저장된 해시비밀번호 비교

    if (!matchedPass) {
      return res.json({
        success: false,
        message: "비밀번호가 일치하지 않습니다.",
      });
    }
    res
      .status(201)
      .json({ success: true, message: "로그인되었습니다.", user: userData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 아이디 찾기
const getUserId = async (req, res) => {
  try {
    const { phone } = req.body;

    const userPhone = await User.findOne({ where: { phone } });

    if (!phone) {
      res.send({
        exists: false,
        message: "아이디를 찾기 위해 등록된 번호를 입력해주세요.",
      });
    }

    if (userPhone) {
      res.status(200).json({
        exists: true,
        userPhone: userPhone,
      });
    } else {
      res.send({
        exists: false,
        message: "일치하는 아이디가 존재하지 않습니다.",
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ exists: false, message: "서버 오류가 발생했습니다." });
  }
};

// 비밀번호 찾기 (이메일 DB조회)
const getUserPw = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "이메일을 입력해주세요." });
    }

    const userId = await User.findOne({ where: { email } });

    if (userId) {
      res.status(200).json({
        success: true,
        message: "해당 이메일이 조회되었습니다.",
        userId: userId.email, // 조회된 이메일만 전송
      });
    } else {
      res.json({
        success: false,
        message: "일치하는 아이디가 존재하지 않습니다.",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

module.exports = {
  userRegister,
  emailCheck,
  phoneCheck,
  userLogin,
  getUserId,
  getUserPw,
};
