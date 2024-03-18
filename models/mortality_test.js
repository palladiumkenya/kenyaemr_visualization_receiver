const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const MortalityTest = sequelize.sequelize.define(
    "mortality_test", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        cause_of_death: Sequelize.TEXT,
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
        tableName: "mortality_test"
    }
);
exports.MortalityTest = MortalityTest;