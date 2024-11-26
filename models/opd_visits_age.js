const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const OPD_Visits_Age = sequelize.sequelize.define(
    "opd_visits_age", {
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
        age: Sequelize.TEXT,
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
        tableName: "opd_visits_age"
    }
);
exports.OPD_Visits_Age = OPD_Visits_Age;