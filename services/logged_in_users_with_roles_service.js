const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { LoggedInUsersWithRoles } = require("../models/logged_in_users_with_roles");

// Persist a logged_in_users_with_roles snapshot. record_pk is keyed on
// mfl_code + submission timestamp, so each submission is retained as its own
// point-in-time row (time series).
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        logged_in_users_with_roles: entry.logged_in_users_with_roles,
        total_active_users_with_roles: entry.total_active_users_with_roles,
        record_pk: base64.encode(mfl_code + timestamp_unix),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('logged_in_users_with_roles rows: %o', rows);
            await LoggedInUsersWithRoles.bulkCreate(rows, {
                updateOnDuplicate: ['logged_in_users_with_roles', 'total_active_users_with_roles', 'hie_facility_id']
            }, { transaction });
        }

        await transaction.commit();
        return facility_attributes;
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
}

module.exports = { handle };
