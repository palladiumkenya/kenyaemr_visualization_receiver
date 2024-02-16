const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Payments = sequelize.sequelize.define(
    "payments", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        payment_mode: Sequelize.TEXT,
        no_of_patients: Sequelize.INTEGER,
        amount_paid: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of usernames
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "payments"
    }
);
exports.Payments = Payments;