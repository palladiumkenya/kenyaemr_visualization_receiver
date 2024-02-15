const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Diagnosis = sequelize.sequelize.define(
    "diagnosis", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        diagnosis_name: Sequelize.TEXT,
        total: Sequelize.BIGINT,
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "diagnosis"
    }
);
exports.Diagnosis = Diagnosis;