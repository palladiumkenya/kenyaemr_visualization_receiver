const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const AdmissionsTest = sequelize.sequelize.define(
    "admissions_test", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mfl_code: Sequelize.INTEGER,
        ward: Sequelize.TEXT,
        timestamp: Sequelize.TEXT,

        capacity: Sequelize.BIGINT,
        occupancy: Sequelize.BIGINT,
        new_admissions: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of record
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "admissions_test"
    }
);
exports.AdmissionsTest = AdmissionsTest;