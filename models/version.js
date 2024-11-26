const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Version = sequelize.sequelize.define(
    "version", {
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
        version: Sequelize.TEXT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "version"
    }
);
exports.Version = Version;