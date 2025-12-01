'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add email column to drivers
    await queryInterface.addColumn('drivers', 'email', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });
    // Add address column to drivers
    await queryInterface.addColumn('drivers', 'address', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('drivers', 'address').catch(() => {});
    await queryInterface.removeColumn('drivers', 'email').catch(() => {});
  }
};
