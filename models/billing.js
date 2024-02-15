const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Billing = sequelize.sequelize.define(
    "billing", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        service_type: Sequelize.TEXT,
        invoices_total: Sequelize.BIGINT,
        amount_due: Sequelize.BIGINT,
        amount_paid: Sequelize.BIGINT,
        balance_due: Sequelize.BIGINT,
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "billing"
    }
);
exports.Billing = Billing;