const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Waittime = sequelize.sequelize.define(
    "waittime", {
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

        queue: Sequelize.TEXT,
        average_wait_time: Sequelize.FLOAT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of usernames
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "waittime"
    }
);
exports.Waittime = Waittime;