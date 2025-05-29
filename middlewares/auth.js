const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization 헤더 없음" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "토큰 누락" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // 컨트롤러에서 사용할 수 있도록 사용자 정보 저장
    next(); // Express 미들웨어 체이닝에서 사용하는 기본 함수 // authenticate 미들웨어에서 next()이 호출되어야 다음 로직으로 넘어감 // 없으면 요청이 처리되지 않고 멈춰버림 (버그 발생)
  } catch (err) {
    return res.status(403).json({ message: "토큰 유효하지 않음" });
  }
};
