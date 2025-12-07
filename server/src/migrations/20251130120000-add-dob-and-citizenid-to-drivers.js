'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add dateOfBirth column
    await queryInterface.addColumn('drivers', 'dateOfBirth', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // Add citizenId column (unique identifier)
    await queryInterface.addColumn('drivers', 'citizenId', {
      type: Sequelize.STRING(64),
      allowNull: true,
    });

    // Create unique index for citizenId to prevent duplicates
    await queryInterface.addIndex('drivers', ['citizenId'], {
      unique: true,
      name: 'drivers_citizenId_unique',
      where: {
        citizenId: { [Sequelize.Op.ne]: null },
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove index then columns
    await queryInterface.removeIndex('drivers', 'drivers_citizenId_unique').catch(() => {});
    await queryInterface.removeColumn('drivers', 'citizenId').catch(() => {});
    await queryInterface.removeColumn('drivers', 'dateOfBirth').catch(() => {});
  }
};
