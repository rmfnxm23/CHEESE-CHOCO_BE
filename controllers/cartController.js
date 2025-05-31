const { Cart, Product } = require("../models");

// 장바구니 등록
const cartRegister = (req, res) => {
  let { id, selectedColor, selectedSize } = req.body;
  console.log(selectedColor, selectedSize);

  const userId = req.user.id; // 미들웨어에서 넣어준 사용자 id
  let quantity = 1;

  Cart.create({
    userId: userId,
    productId: Number(id),
    selectColor: selectedColor,
    selectSize: selectedSize,
    quantity,
  });

  res.json({ message: "success" });
};

// 장바구니 조회 (사용자 id).
const getMyCartList = async (req, res) => {
  try {
    // let {} = req.params;
    const userId = req.user.id;
    console.log(userId);

    const MyCart = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    console.log(MyCart);

    res.status(200).json({ data: MyCart });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { cartRegister, getMyCartList };
