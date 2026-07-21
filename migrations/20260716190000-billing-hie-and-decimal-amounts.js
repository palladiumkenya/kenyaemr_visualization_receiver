'use strict';

// ward_admissions sibling: billing v2 needs hie_facility_id and decimal amounts.
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('billing', 'hie_facility_id', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    // Widen amount columns from BIGINT to DECIMAL(15,2) to preserve cents.
    // `refund` was previously added as BIGINT.
    for (const col of ['amount_due', 'amount_paid', 'balance_due', 'refund']) {
      await queryInterface.changeColumn('billing', col, {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      });
    }
  },

  async down (queryInterface, Sequelize) {
    for (const col of ['amount_due', 'amount_paid', 'balance_due', 'refund']) {
      await queryInterface.changeColumn('billing', col, {
        type: Sequelize.BIGINT,
        allowNull: true
      });
    }
    await queryInterface.removeColumn('billing', 'hie_facility_id');
  }
};
