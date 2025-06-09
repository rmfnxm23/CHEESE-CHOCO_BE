"use strict";
const Sequelize = require("sequelize");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  payment.init(
    {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.STRING,
        allowNull: false,
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
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
    }
  );
  return payment;
};
