'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('mortality', 'hie_facility_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('mortality', 'hie_facility_id');
  }
};
