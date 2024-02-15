const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Workload = sequelize.sequelize.define(
    "workload", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        department: Sequelize.TEXT,
        total: Sequelize.BIGINT,
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "workload"
    }
);
exports.Workload = Workload;