const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const BedManagement = sequelize.sequelize.define(
    "bed_management", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        mfl_code: Sequelize.INTEGER,
        county: Sequelize.TEXT,
        sub_county: Sequelize.TEXT,
        facility_name:Sequelize.TEXT,
        ward: Sequelize.TEXT,
        timestamp: Sequelize.TEXT,

        ward: Sequelize.TEXT,
        bed_tag: Sequelize.TEXT,
        bed_type: Sequelize.TEXT,
        authorized_capacity: Sequelize.BIGINT,
        actual_beds: Sequelize.BIGINT,
        occupied_beds: Sequelize.BIGINT,
        available_beds: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of record
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "bed_management"
    }
);
exports.BedManagement = BedManagement;