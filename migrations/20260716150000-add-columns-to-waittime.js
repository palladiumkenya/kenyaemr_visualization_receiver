'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('waittime', 'hie_facility_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    await queryInterface.addColumn('waittime', 'total_wait_time', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('waittime', 'patient_count', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('waittime', 'patient_count');
    await queryInterface.removeColumn('waittime', 'total_wait_time');
    await queryInterface.removeColumn('waittime', 'hie_facility_id');
  }
};
