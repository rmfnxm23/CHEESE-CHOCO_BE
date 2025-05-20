"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
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
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
