'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('route_stops', 'durationFromStart', {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: "Time in minutes from the start of the route to this stop."
    });
    await queryInterface.addColumn('route_stops', 'distanceFromStart', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0,
      comment: "Distance in km from the start of the route to this stop."
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('route_stops', 'durationFromStart');
    await queryInterface.removeColumn('route_stops', 'distanceFromStart');
  }
};
