const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const DiagnosisTest = sequelize.sequelize.define(
    "diagnosis_test", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        diagnosis_name: Sequelize.TEXT,
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
        tableName: "diagnosis_test"
    }
);
exports.DiagnosisTest = DiagnosisTest;