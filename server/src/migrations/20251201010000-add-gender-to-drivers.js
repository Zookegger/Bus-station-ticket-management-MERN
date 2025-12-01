'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add gender column to drivers table
    await queryInterface.addColumn('drivers', 'gender', {
      type: Sequelize.ENUM('MALE', 'FEMALE', 'OTHER'),
      allowNull: true,
      defaultValue: 'OTHER',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove gender column
    await queryInterface.removeColumn('drivers', 'gender').catch(() => {});
    // On some dialects ENUM types are tied to the column; removing the column is sufficient.
    // No explicit type drop required for MySQL. For postgres, a manual DROP TYPE would be needed.
  }
};
