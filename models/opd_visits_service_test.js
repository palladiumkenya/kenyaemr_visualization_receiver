const sequelize = require("../db_config_test");
const Sequelize = require("sequelize");

const OPD_Visits_Services = sequelize.sequelize.define(
    "opd_visits", {
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
        service: Sequelize.TEXT,
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
        tableName: "opd_visits"
    }
);
exports.OPD_Visits_Services = OPD_Visits_Services;