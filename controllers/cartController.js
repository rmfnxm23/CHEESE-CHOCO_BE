const { Cart, Product } = require("../models");

// 장바구니 등록
const cartRegister = async (req, res) => {
  // let { id, selectedColor, selectedSize } = req.body;
  // console.log(selectedColor, selectedSize);
  let { id, options } = req.body;
  console.log(options);
  // return;
  const userId = req.user.id; // 미들웨어에서 넣어준 사용자 id
  // let quantity = 1;

  // Cart.create({
  //   userId: userId,
  //   productId: Number(id),
  //   selectColor: options.selectColor,
  //   selectSize: options.selectSize,
  //   price: options.price,
  //   quantity: options.quantity,
  // });
  // 각 옵션마다 Cart에 추가
  await Promise.all(
    options.map((opt) =>
      Cart.create({
        userId: userId,
        productId: Number(id),
        selectColor: opt.selectColor,
        selectSize: opt.selectSize,
        price: opt.price,
        quantity: opt.quantity,
      })
    )
  );

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

    // console.log(MyCart);

    res.status(200).json({ data: MyCart });
  } catch (err) {
    console.error(err);
  }
};

// 장바구니에 담긴 상품 삭제
const deleteCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = Number(req.params.id);
  console.log(userId, cartItemId); // 1 1
  // return;
  try {
    // 본인 장바구니 아이템인지 확인 (보안)
    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      return res
        .status(404)
        .json({ message: "장바구니 아이템을 찾을 수 없습니다." });
    }

    await Cart.destroy({ where: { id: cartItemId } });
    res.json({ message: "삭제 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "삭제 실패" });
  }
};

module.exports = { cartRegister, getMyCartList, deleteCartItem };
