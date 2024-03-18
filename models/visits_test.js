const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const VisitsTest = sequelize.sequelize.define(
    "visits_test", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        visit_type: Sequelize.TEXT,
        total: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of record
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "visits_test"
    }
);
exports.VisitsTest = VisitsTest;