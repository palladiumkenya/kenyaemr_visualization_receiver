'use strict';

module.exports = {
  async up(queryInterface, Sequelize)  {
    await queryInterface.addColumn('billing', 'refund', {
      type: Sequelize.BIGINT
    });

  },

  async down(queryInterface, Sequelize){
    await queryInterface.removeColumn('billing', 'refund');
  }
};
