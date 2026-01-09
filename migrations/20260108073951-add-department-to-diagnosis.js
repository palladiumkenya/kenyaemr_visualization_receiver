'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('diagnosis', 'department_name', { type: Sequelize.STRING });
  },

  async down(queryInterface, Sequelize) {
   await queryInterface.removeColumn('diagnosis', 'department_name');
  }
};
