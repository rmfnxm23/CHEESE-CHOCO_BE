const { OrderItem } = require("../models");

const saveItem = async (req, res) => {
  try {
    const { paymentId, items } = req.body;

    const orderItems = await Promise.all(
      items.map((item) =>
        OrderItem.create({
          paymentId,
          productId: item.productId,
          selectColor: item.selectColor,
          selectSize: item.selectSize,
          price: item.price,
          quantity: item.quantity,
        })
      )
    );

    res.status(201).json({ data: orderItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "주문 아이템 저장 실패" });
  }
};

module.exports = { saveItem };
