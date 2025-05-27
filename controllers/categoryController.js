const { Category } = require("../models");

const getCategory = async (req, res) => {
  try {
    const categories = await Category.findAll({});
    console.log(categories, "카테고리 나오냐");
    res.json({ data: categories });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getCategory };
