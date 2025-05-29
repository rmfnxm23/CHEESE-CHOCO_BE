"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      img: {
        type: Sequelize.TEXT("long"),
      },
      name: {
        type: Sequelize.STRING(100),
      },
      price: {
        type: Sequelize.INTEGER(15),
      },
      content: {
        type: Sequelize.TEXT("long"),
      },
      color: {
        type: Sequelize.STRING(100),
      },
      size: {
        type: Sequelize.STRING(100),
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
    await queryInterface.dropTable("products");
  },
};
