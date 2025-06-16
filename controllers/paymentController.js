require("dotenv").config();
const {
  Payment,
  OrderItem,
  Cart,
  Product,
  Shopping_Address,
} = require("../models");
const axios = require("axios");

// 결제 등록
const payOrder = async (req, res) => {
  try {
    const { userId, shippingInfoId, totalAmount } = req.body;

    const payment = await Payment.create({
      userId,
      shippingInfoId,
      amount: totalAmount,
      status: "pending",
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "결제 생성 실패" });
  }
};

// 결제 승인 확인
const tossConfirm = async (req, res) => {
  const { paymentKey, orderId, amount, items = [], paymentId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "items가 없습니다" });
  }
  const userId = req.user.id;

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

    // ✅ 결제 업데이트
    await Payment.update(
      { orderId: data.orderId, method: data.method, status: "DONE" },
      {
        where: { id: Number(paymentId) },
      }
    );

    // ✅ 장바구니에서 삭제
    const cartIds = items.map((item) => item);
    await Cart.destroy({
      where: {
        id: cartIds, // 또는 userId 등
        userId, // 보안 강화
      },
    });

    // ✅ 결제 정보 DB 저장 등 처리
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(
      "❌ Toss 결제 승인 실패:",
      error.response?.data || error.message
    );

    res.status(400).json({
      success: false,
      error: error.response?.data || error.message, // 💡 Toss가 보낸 구체적인 에러 메시지 전달
    });
  }
};

// 결제 내역 조회
const getOrderList = async (req, res) => {
  try {
    const userId = req.user.id;

    const MyOrder = await Payment.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["name", "price", "img"],
            },
          ],
        },
        {
          model: Shopping_Address,
          attributes: ["name", "address", "phone"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // img 파싱해서 첫 번째 이미지만 추가
    const parsedOrder = MyOrder.map((order) => {
      const items = order.items.map((item) => {
        let firstImage = null;
        try {
          const imgArray = JSON.parse(item.product.img || "[]");
          firstImage = imgArray[0];
        } catch (e) {
          firstImage = null;
        }

        return {
          ...item.toJSON(),
          product: {
            ...item.product.toJSON(),
            firstImage,
          },
        };
      });

      return {
        ...order.toJSON(),
        items,
      };
    });

    res.status(200).json({ data: parsedOrder });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { payOrder, tossConfirm, getOrderList };
