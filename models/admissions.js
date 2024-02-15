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
        ward: Sequelize.TEXT,
        time_stamp: Sequelize.TEXT,

        capacity: Sequelize.BIGINT,
        occupancy: Sequelize.BIGINT,
        new_admissions: Sequelize.BIGINT,
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "admissions"
    }
);
exports.Admissions = Admissions;