const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./user")(sequelize, Sequelize);
db.Category = require("./category")(sequelize, Sequelize);
db.Product = require("./product")(sequelize, Sequelize);
db.Cart = require("./cart")(sequelize, Sequelize);
db.Shopping_Address = require("./shopping_address")(sequelize, Sequelize);
db.Payment = require("./payment")(sequelize, Sequelize);

// js는 single 스레드라 순차적으로 읽기 때문에 각각의 파일에 관계를 설정할 경우 연결이 제대로 되지 않는다. index에 작성해야 읽을 수 있음.

// Cart → Product (N:1)
db.Cart.belongsTo(db.Product, {
  foreignKey: "productId",
  as: "product", // Cart에서 Product 조회할 때 사용
});

// Product → Cart (1:N)
db.Product.hasMany(db.Cart, {
  foreignKey: "productId",
  as: "carts", // Product에서 Cart 항목들 조회할 때 사용
});

db.Category.hasMany(db.Product, { foreignKey: "categoryId" });
db.Product.belongsTo(db.Category, { foreignKey: "categoryId" });

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결됨.");
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = db;
