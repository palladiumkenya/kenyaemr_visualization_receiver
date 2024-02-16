const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const Inventory = sequelize.sequelize.define(
    "inventory", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        time_stamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        item_type: Sequelize.TEXT,
        item_name: Sequelize.TEXT,
        unit_of_measure: Sequelize.TEXT,
        quantity_at_hand: Sequelize.BIGINT,
        quantity_consumed: Sequelize.BIGINT,
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of usernames
          },
       }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "inventory"
    }
);
exports.Inventory = Inventory;