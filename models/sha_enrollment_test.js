const sequelize = require("../db_config_test");
const Sequelize = require("sequelize");

const ShaEnrol = sequelize.sequelize.define(
    "sha_enrollment", {
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
        sha_enrollment: Sequelize.TEXT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "sha_enrollment"
    }
);
exports.ShaEnrol = ShaEnrol;