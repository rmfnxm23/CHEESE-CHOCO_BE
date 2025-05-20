"use strict";
const Sequelize = require("sequelize");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  user.init(
    {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING(25),
      },
      password: {
        type: Sequelize.STRING(100),
      },
      name: {
        type: Sequelize.STRING(25),
      },
      phone: {
        type: Sequelize.STRING(25),
      },
      loginType: {
        type: Sequelize.STRING(15),
      },
      userType: {
        type: Sequelize.STRING(15),
      },
      pwResetCode: {
        type: Sequelize.STRING(11),
        allowNull: true,
      },
      pwResetCodeEx: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: false,
      modelName: "User",
      tableName: "users",
    }
  );
  return user;
};
