'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('logged_in_users_with_roles', {
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
      hie_facility_id: {
        type: Sequelize.STRING(255),
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
      logged_in_users_with_roles: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      total_active_users_with_roles: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('logged_in_users_with_roles');
  }
};
