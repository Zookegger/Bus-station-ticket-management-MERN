'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add the status column as an ENUM with default 'ACTIVE'
    await queryInterface.addColumn('drivers', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    });

    // Backfill existing rows based on isSuspended / isActive
    await queryInterface.sequelize.query(`
      UPDATE drivers
      SET status = CASE
        WHEN isSuspended = 1 THEN 'SUSPENDED'
        WHEN isActive = 1 THEN 'ACTIVE'
        ELSE 'INACTIVE'
      END
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove the column. For Postgres, Sequelize creates a named ENUM type
    // which may need to be dropped separately; removeColumn will handle most cases.
    await queryInterface.removeColumn('drivers', 'status');

    // If using Postgres, drop the enum type if it exists
    try {
      if (queryInterface.sequelize.getDialect && queryInterface.sequelize.getDialect() === 'postgres') {
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_drivers_status";');
      }
    } catch (err) {
      // ignore
    }
  }
};
