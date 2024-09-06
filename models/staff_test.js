const sequelize = require("../db_config_test");
const Sequelize = require("sequelize");

const Staff = sequelize.sequelize.define(
    "staff", {
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
        staff: Sequelize.TEXT,
        staff_count: Sequelize.BIGINT,
           record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "staff"
    }
);
exports.Staff = Staff;