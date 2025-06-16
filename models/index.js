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
db.OrderItem = require("./orderitem")(sequelize, Sequelize);

// js는 single 스레드라 순차적으로 읽기 때문에 각각의 파일에 관계를 설정할 경우 연결이 제대로 되지 않는다. index에 작성해야 읽을 수 있음.

// Cart → Product (N:1)
db.Cart.belongsTo(db.Product, {
  foreignKey: "productId",
  as: "product", // Cart에서 Product 조회할 때 사용
  onUpdate: "CASCADE",
  onDelete: "CASCADE", // 꼭 추가
  hooks: true, // Sequelize가 cascade를 실행하려면 hooks도 필요
});

// Product → Cart (1:N)
db.Product.hasMany(db.Cart, {
  foreignKey: "productId",
  as: "carts", // Product에서 Cart 항목들 조회할 때 사용
  onUpdate: "CASCADE",
  onDelete: "CASCADE",
  hooks: true,
});

db.Category.hasMany(db.Product, { foreignKey: "categoryId" });
db.Product.belongsTo(db.Category, { foreignKey: "categoryId" });

// 1. Payment → OrderItem (1:N)
db.Payment.hasMany(db.OrderItem, {
  foreignKey: "paymentId",
  as: "items", // Payment에서 OrderItem들 조회할 때 사용
  onUpdate: "CASCADE",
  // onDelete: "CASCADE",
  onDelete: "RESTRICT", // ✅ 삭제 제한 (혹은 soft delete 사용)
  hooks: true,
});

// 2. OrderItem → Payment (N:1)
db.OrderItem.belongsTo(db.Payment, {
  foreignKey: "paymentId",
  as: "payment", // OrderItem에서 Payment 조회할 때 사용
  onUpdate: "CASCADE",
  // onDelete: "CASCADE",
  onDelete: "RESTRICT", // ✅ 삭제 제한
  hooks: true,
});

// 3. OrderItem → Product (N:1)
db.OrderItem.belongsTo(db.Product, {
  foreignKey: "productId",
  as: "product", // OrderItem에서 Product 조회할 때 사용
  onUpdate: "CASCADE",
  onDelete: "SET NULL", // 상품이 삭제되더라도 주문 기록은 남기고 싶다면 SET NULL이 일반적
  hooks: true,
});

// 4. Product → OrderItem (1:N)
db.Product.hasMany(db.OrderItem, {
  foreignKey: "productId",
  as: "orderItems",
  onUpdate: "CASCADE",
  onDelete: "SET NULL",
  hooks: true,
});

db.Payment.belongsTo(db.Shopping_Address, { foreignKey: "shippingInfoId" });
db.Shopping_Address.hasMany(db.Payment, { foreignKey: "shippingInfoId" });

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결됨.");
  })
  .catch((err) => {
    console.error(err);
  });

module.exports = db;
