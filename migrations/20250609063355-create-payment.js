"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payments", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true, // Toss의 주문 ID와 연결
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      method: {
        type: Sequelize.STRING,
        allowNull: true, // 카드, 가상계좌, 휴대폰결제 등
      },
      status: {
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users", // 유저 테이블 이름
          key: "id",
        },
        onDelete: "CASCADE",
      },
      shippingInfoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "shopping_addresses", // 배송지 테이블 이름
          key: "id",
        },
        onDelete: "SET NULL",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("payments");
  },
};
