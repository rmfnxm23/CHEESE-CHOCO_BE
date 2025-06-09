require("dotenv").config();
const { Payment } = require("../models");
const axios = require("axios");

const tossConfirm = async (req, res) => {
  console.log("111111111");
  const { paymentKey, orderId, amount } = req.body;
  const userId = req.user.id; // 로그인한 사용자 정보
  console.log("[🔐 TOSS_SECRET_KEY]", process.env.TOSS_SECRET_KEY);
  try {
    const response = await axios.post(
      `https://api.tosspayments.com/v1/payments/confirm`, // ✅ Toss 결제 승인 요청 URL
      {
        paymentKey,
        orderId,
        amount,
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.TOSS_SECRET_KEY}:`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    console.log(data);

    await Payment.create({
      orderId: data.orderId,
      amount: data.totalAmount,
      method: data.method,
      status: data.status,
      userId: userId,
    });

    // ✅ 결제 정보 DB 저장 등 처리
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error(
      "❌ Toss 결제 승인 실패:",
      error.response?.data || error.message
    );

    res.status(400).json({
      success: false,
      message: "결제 검증 실패",
      error: error.response?.data || error.message, // 💡 Toss가 보낸 구체적인 에러 메시지 전달
    });
  }
};

const getOrderList = async (req, res) => {
  try {
    const userId = req.user.id;

    const MyOrder = await Payment.findAll({ where: { userId } });

    res.status(200).json({ data: MyOrder });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { tossConfirm, getOrderList };
