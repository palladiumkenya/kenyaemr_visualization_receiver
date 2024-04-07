const sequelize = require("../db_config_test");
const Sequelize = require("sequelize");

const Billing = sequelize.sequelize.define(
    "billing", {
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
        service_type: Sequelize.TEXT,
        invoices_total: Sequelize.BIGINT,
        amount_due: Sequelize.BIGINT,
        amount_paid: Sequelize.BIGINT,
        balance_due: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of usernames
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "billing"
    }
);
exports.Billing = Billing;