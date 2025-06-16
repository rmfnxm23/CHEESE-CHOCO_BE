const { User } = require("../models");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();
const jwt = require("jsonwebtoken");

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

    const payload = { id: userData.id, email: userData.email };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    const refreshToken = jwt.sign(
      { id: userData.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      success: true,
      message: "로그인되었습니다.",
      user: userData,
      accessToken,
      refreshToken,
    });
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

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.json({
        success: false,
        message: "일치하는 아이디가 존재하지 않습니다.",
      });
    }

    // 인증코드 생성 (1000 ~ 9999 사이)
    const code = Math.floor(Math.floor(1000 + Math.random() * 9000));

    // 만료시간 설정 (현재 시간으로부터 10분까지 유효시간)
    const codeExpirationTime = Date.now() + 1000 * 60 * 10;

    await User.update(
      {
        pwResetCode: code,
        pwResetCodeEx: codeExpirationTime,
      },
      { where: { id: user.id } }
    );

    // 새 비밀번호 등록 링크를 메일로 전송
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_ADDRESS,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 비밀번호 재설정 url
    const link = `http://localhost:3000/find/changepw/${user.id}`;

    // 메일 옵션 설정
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "[CHEESE&CHOCO] 비밀번호 재설정 안내",
      html: `
        <p>아래 링크를 클릭하여 인증코드를 입력하고 비밀번호를 재설정하세요.<br>
        인증코드: <strong>${code}</strong></p>
        <a href="${link}">비밀번호 재설정</a>
        <p>위 링크는 10분동안 유효합니다.</p>
        `,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
};

// 인증 코드 검증 (일치 확인)
const verifyCode = async (req, res) => {
  try {
    let { id, code } = req.body;

    const userData = await User.findOne({ where: { id } });

    if (!userData) {
      return res.json({ success: false, message: "유저를 찾을 수 없습니다." });
    }

    // 인증코드의 유효시간 체크
    const isExpired = userData.pwResetCodeEx > Date.now();

    if (!isExpired) {
      return res.json({
        success: false,
        message: "인증번호가 만료되었습니다.",
      });
    }

    if (userData.pwResetCode !== code) {
      return res.json({
        success: false,
        message: "인증번호가 일치하지 않습니다.",
      });
    }

    res.json({ success: true, message: "인증되었습니다." });
  } catch (err) {
    console.error(err);
  }
};

// 비밀번호 변경
const updateUserPw = async (req, res) => {
  try {
    let { id, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const userData = await User.update(
      { password: hashPassword }, // 수정할 데이터
      { where: { id } }
    );

    if (userData) {
      res.status(200).json({
        success: true,
        message: "비밀번호 변경에 성공하였습니다.",
      });
    } else {
      res.json({
        success: false,
        message: "비밀번호 변경에 실패하셨습니다.",
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// 로그인한 사용자(나) 정보
const getMe = async (req, res) => {
  try {
    const userId = req.user.id; // 로그인한 사용자 id

    const user = await User.findOne({
      where: { id: userId },
      attributes: { exclude: ["password"] }, // 비밀번호 제외
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 회원정보 수정
const updateMe = async (req, res) => {
  try {
    let { id, phone } = req.body;

    await User.update({ phone }, { where: { id } });

    res.status(201).json({ success: true, message: "정보가 수정되었습니다." });
  } catch (err) {
    console.error("회원정보 수정 중 오류 발생", err);
    return res.status(500).json({ success: false, message: "서버 오류" });
  }
};

// 회원 탈퇴
const DeleteMe = async (req, res) => {
  try {
    const userId = req.user.id;
    await User.destroy({ where: { id: userId } });

    res.status(201).json({ message: "회원 탈퇴되셨습니다." });
  } catch (err) {
    console.error("회원 탈퇴 중 오류 발생", err);
  }
};

module.exports = {
  userRegister,
  emailCheck,
  phoneCheck,
  userLogin,
  getUserId,
  getUserPw,
  verifyCode,
  updateUserPw,
  getMe,
  updateMe,
  DeleteMe,
};
