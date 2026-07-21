const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Admissions = sequelize.sequelize.define(
    "admissions", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mfl_code: Sequelize.INTEGER,
        hie_facility_id: Sequelize.STRING,
        county: Sequelize.TEXT,
        sub_county: Sequelize.TEXT,
        facility_name:Sequelize.TEXT,
        ward: Sequelize.TEXT,
        timestamp: Sequelize.TEXT,

        capacity: Sequelize.BIGINT,
        occupancy: Sequelize.BIGINT,
        new_admissions: Sequelize.BIGINT,

        encounter_date: Sequelize.DATE,
        no_admissions: Sequelize.BIGINT,
        no_discharges: Sequelize.BIGINT,
        avg_length_of_stay_in_days: Sequelize.FLOAT,
        no_deaths: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of record
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "admissions"
    }
);
exports.Admissions = Admissions;