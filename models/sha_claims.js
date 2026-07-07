const sequelize = require("../db_config");
const Sequelize = require("sequelize");

const ShaClaims = sequelize.sequelize.define(
    "sha_claims", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        timestamp: Sequelize.TEXT,
        mfl_code: Sequelize.INTEGER,
        county: Sequelize.TEXT,
        sub_county: Sequelize.TEXT,
        facility_name: Sequelize.TEXT,
        claim_date: Sequelize.DATEONLY,
        scheme_code: Sequelize.TEXT,
        status: Sequelize.TEXT,
        count: Sequelize.INTEGER,
        amount: Sequelize.DECIMAL(15, 2),
        record_pk: {
            type: Sequelize.STRING,
            unique: true // Ensure uniqueness of the composite key
        },
    }, {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: "sha_claims"
    }
);
exports.ShaClaims = ShaClaims;
