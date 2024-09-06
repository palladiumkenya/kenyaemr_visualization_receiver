const sequelize = require("../db_config_test");
const Sequelize = require("sequelize");

const Immunization = sequelize.sequelize.define(
    "immunization", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        county: Sequelize.TEXT,
        sub_county: Sequelize.TEXT,
        facility_name:Sequelize.TEXT,
        vaccine: Sequelize.TEXT,
        total: Sequelize.BIGINT,
           record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of usernames
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "immunization"
    }
);
exports.Immunization = Immunization;