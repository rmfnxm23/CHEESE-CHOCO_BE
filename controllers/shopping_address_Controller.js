const { Shopping_Address } = require("../models");

const addressRegister = async (req, res) => {
  const { name, phone, zipCode, address } = req.body;
  const userId = req.user.id; // 로그인한 사용자 정보
  console.log(req.body, "1");
  //   console.log(userId, "2");
  try {
    const shippingInfo = await Shopping_Address.create({
      userId,
      name,
      zipCode,
      address,
      phone,
    });
    res.status(200).json({ message: "배송지 저장 완료", data: shippingInfo });
  } catch (err) {
    res.status(500).json({ message: "배송지 저장 실패" });
  }
};

const getAddress = async (req, res) => {
  try {
    const addr = await Shopping_Address.findAll({});

    res.status(200).json({ data: addr });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { addressRegister, getAddress };
