'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('bed_management', {
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
    ward: {
      type: Sequelize.STRING(150),
      allowNull: true
    },                         
    bed_tag: {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    bed_type: {
      type: Sequelize.STRING(150),
      allowNull: true
    },
    authorized_capacity: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    actual_beds: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    occupied_beds: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    available_beds: {
      type: Sequelize.INTEGER,
      allowNull: true
    },                     
    timestamp: {
      type: 'TIMESTAMP'
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
    await queryInterface.dropTable('bed_management');
  }
};
