'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const columns = {
      hie_facility_id: Sequelize.STRING(255),
      encounter_date: Sequelize.DATE,
      no_admissions: Sequelize.BIGINT,
      no_discharges: Sequelize.BIGINT,
      avg_length_of_stay_in_days: Sequelize.FLOAT,
      no_deaths: Sequelize.BIGINT
    };
    for (const [name, type] of Object.entries(columns)) {
      await queryInterface.addColumn('admissions', name, { type, allowNull: true });
    }
  },

  async down (queryInterface, Sequelize) {
    const names = ['no_deaths', 'avg_length_of_stay_in_days', 'no_discharges', 'no_admissions', 'encounter_date', 'hie_facility_id'];
    for (const name of names) {
      await queryInterface.removeColumn('admissions', name);
    }
  }
};
