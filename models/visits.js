const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Visits = sequelize.sequelize.define(
    "visits", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        visit_type: Sequelize.TEXT,
        total: Sequelize.BIGINT,
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "visits"
    }
);
exports.Visits = Visits;