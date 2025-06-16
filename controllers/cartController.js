const { Cart, Product } = require("../models");

// 장바구니 등록
const cartRegister = async (req, res) => {
  let { id, options } = req.body;

  const userId = req.user.id; // 미들웨어에서 넣어준 사용자 id

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
    const userId = req.user.id;

    const MyCart = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
    });

    // img 파싱 처리
    const parsedCart = MyCart.map((item) => {
      const product = item.product;

      return {
        ...item.toJSON(),
        product: product
          ? {
              ...product,
              name: product.name,
              price: product.price,
              img: JSON.parse(product.img || "[]"),
              color: JSON.parse(product.color || "[]"),
              size: JSON.parse(product.size || "[]"),
            }
          : null,
      };
    });

    res.status(200).json({ data: parsedCart });
  } catch (err) {
    console.error(err);
  }
};

// 장바구니에 담긴 상품 삭제
const deleteCartItem = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = Number(req.params.id);

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
