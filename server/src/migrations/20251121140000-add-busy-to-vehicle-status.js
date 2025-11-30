'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Modify ENUM to include BUSY
    await queryInterface.changeColumn('vehicles', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'BUSY', 'MAINTENANCE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    });
  },
  async down(queryInterface, Sequelize) {
    // Revert ENUM (BUSY removed). NOTE: Records with BUSY will fail revert if present.
    await queryInterface.changeColumn('vehicles', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE'),
      allowNull: false,
      defaultValue: 'ACTIVE'
    });
  }
};