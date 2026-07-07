'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('sha_claims', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      record_pk: {
        type: Sequelize.STRING(255),
        unique: true
      },
      mfl_code: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      facility_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      county: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      sub_county: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      claim_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      scheme_code: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      count: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      timestamp: {
        type: Sequelize.TEXT
      },
      created_at: {
        type: 'TIMESTAMP'
      },
      updated_at: {
        type: 'TIMESTAMP'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('sha_claims');
  }
};
