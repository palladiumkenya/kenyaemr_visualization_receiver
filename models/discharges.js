const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Discharges = sequelize.sequelize.define(
    "discharges", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        discharge_status: Sequelize.TEXT,
        total: Sequelize.BIGINT,
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "discharges"
    }
);
exports.Discharges = Discharges;