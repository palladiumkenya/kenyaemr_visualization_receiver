const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Revenue_by_department = sequelize.sequelize.define(
    "revenue_by_department", {
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
        department:Sequelize.TEXT,
        patient_count:Sequelize.BIGINT,
        amount: Sequelize.FLOAT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of usernames
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "revenue_by_department"
    }
);
exports.Revenue_by_department = Revenue_by_department;