const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const InventoryTest = sequelize.sequelize.define(
    "inventory_test", {
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
        tableName: "inventory_test"
    }
);
exports.InventoryTest = InventoryTest;