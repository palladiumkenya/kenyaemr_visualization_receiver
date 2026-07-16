const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const LoggedInUsersWithRoles = sequelize.sequelize.define(
    "logged_in_users_with_roles", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        hie_facility_id: Sequelize.STRING,
        county: Sequelize.TEXT,
        sub_county: Sequelize.TEXT,
        facility_name: Sequelize.TEXT,
        logged_in_users_with_roles: Sequelize.INTEGER,
        total_active_users_with_roles: Sequelize.INTEGER,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of the composite key
        },
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "logged_in_users_with_roles"
    }
);
exports.LoggedInUsersWithRoles = LoggedInUsersWithRoles;
