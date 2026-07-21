'use strict';

// The payments dataset fans out into two pre-existing tables.
const TABLES = ['payments', 'revenue_by_department'];

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
