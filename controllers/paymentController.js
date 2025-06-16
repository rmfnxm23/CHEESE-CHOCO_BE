require("dotenv").config();
const {
  Payment,
  OrderItem,
  Cart,
  Product,
  Shopping_Address,
} = require("../models");
const axios = require("axios");

const payOrder = async (req, res) => {
  try {
    const { userId, shippingInfoId, totalAmount } = req.body;

    // console.log("dfsdfsdfsfsdf", userId, shippingInfoId, totalAmount);

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

const tossConfirm = async (req, res) => {
  console.log("111111111");
  // const { paymentKey, orderId, amount, items, paymentId } = req.body;
  const { paymentKey, orderId, amount, items = [], paymentId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "items가 없습니다" });
  }
  const userId = req.user.id; // 로그인한 사용자 정보
  // console.log("[🔐 TOSS_SECRET_KEY]", process.env.TOSS_SECRET_KEY);
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
    // console.log(data);

    // try {
    //   const res = await axios.get("/");
    // } catch (err) {
    //   console.error(err);
    // }

    // await Payment.update({
    //   orderId: data.orderId,
    //   amount: data.totalAmount,
    //   method: data.method,
    //   status: "DONE",
    //   userId: userId,
    // });
    console.log("결제 항목:", items);
    // console.log(typeof paymentId, "12321321351351");
    // return;
    await Payment.update(
      { orderId: data.orderId, method: data.method, status: "DONE" },
      {
        where: { id: Number(paymentId) },
      }
    );
    // return;
    // ✅ Payment 저장
    // const payment = await Payment.create({
    //   userId,
    //   orderId,
    //   amount: totalAmount,
    //   method: verifyRes.data.method,
    //   status: "DONE",
    // });

    // ✅ PaymentItem 저장
    // for (const item of items) {
    //   await PaymentItem.create({
    //     paymentId: payment.id,
    //     productId: item.productId,
    //     quantity: item.quantity,
    //     price: item.price,
    //   });
    // }

    // return;
    // if (items && Array.isArray(items)) {
    //   const orderItems = items.map((item) => ({
    //     paymentId: paymentId,
    //     productId: item.id, // item 객체 안의 product id
    //     quantity: item.quantity, // 수량
    //     price: item.price, // 단가
    //   }));
    //   await OrderItem.bulkCreate(orderItems);
    // }

    // return;

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
            firstImage, // 👈 프론트에서 바로 사용 가능
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
