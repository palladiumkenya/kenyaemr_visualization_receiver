const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const PaymentsTest = sequelize.sequelize.define(
    "payments_test", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        county: Sequelize.TEXT,
        sub_county: Sequelize.TEXT,
        facility_name:Sequelize.TEXT,

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
        tableName: "payments_test"
    }
);
exports.PaymentsTest = PaymentsTest;