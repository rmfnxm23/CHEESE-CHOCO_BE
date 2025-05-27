const express = require("express");
const app = express();
const port = 5000;
const path = require("path");

// cors 불러오기
const cors = require("cors"); // Cross Origin Resource Sharing의 약자로서 포트 번호, 도메인 주소 등이 다를 때 보안 상의 이유로 api 호출을 차단하는 것 // cors를 사용하지 않을 경우, Network Error 발생으로 axios 요청을 받지 못하게 됨

const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const categoryRouter = require("./routes/categoryRoute");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// 미들웨어
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json()); // JSON 형태의 데이터 전달
app.use(express.urlencoded({ extended: true })); // URL-encoded 형식의 데이터 전달 (주로 form 데이터)
// extended: true → 중첩 객체 가능 (qs 사용: 설치 필요)
// extended: false → 단순 key-value만 가능 (querystring 사용)

app.use("/user", userRouter);
app.use("/admin", productRouter);
app.use("/category", categoryRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
