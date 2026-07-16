'use strict';

// The visits dataset fans out into three pre-existing tables.
const TABLES = ['visits', 'opd_visits', 'opd_visits_age'];

module.exports = {
  async up (queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.addColumn(table, 'hie_facility_id', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    for (const table of TABLES) {
      await queryInterface.removeColumn(table, 'hie_facility_id');
    }
  }
};
