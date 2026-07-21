const sequelize = require("../db_config");
const base64 = require("base64util");
const logger = require("../logger");

const { ShaEnrollment } = require("../models/sha_enrollment");

// Persist the sha enrollment count. Reuses the pre-existing sha_enrollment model.
// `data` is a scalar count (not an array). record_pk keyed on mfl_code +
// submission timestamp (per-submission snapshot).
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    // Nothing reported for the period.
    if (data === null || data === undefined) {
        return facility_attributes;
    }

    const row = {
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        sha_enrollment: data,
        record_pk: base64.encode(mfl_code + timestamp_unix),
    };

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        logger.debug('sha_enrollments row: %o', row);
        await ShaEnrollment.bulkCreate([row], {
            updateOnDuplicate: ['sha_enrollment', 'hie_facility_id']
        }, { transaction });

        await transaction.commit();
        return facility_attributes;
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error;
    }
}

module.exports = { handle };
