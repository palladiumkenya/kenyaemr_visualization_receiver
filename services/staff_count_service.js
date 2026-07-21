const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Staff } = require("../models/staff");

// Persist staff counts per role. Reuses the pre-existing staff model.
// record_pk keyed on mfl_code + submission timestamp + staff.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        staff: entry.staff,
        staff_count: entry.staff_count,
        record_pk: base64.encode(mfl_code + timestamp_unix + entry.staff),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('staff_count rows: %o', rows);
            await Staff.bulkCreate(rows, {
                updateOnDuplicate: ['staff_count', 'hie_facility_id']
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
