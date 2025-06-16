const { Category } = require("../models");

const getCategory = async (req, res) => {
  try {
    const categories = await Category.findAll({});

    res.json({ data: categories });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getCategory };
