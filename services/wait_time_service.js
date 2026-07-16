const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Waittime } = require("../models/waittime");

// Persist wait time per queue. Reuses the pre-existing waittime model.
// record_pk keyed on mfl_code + submission timestamp + queue (time series).
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        queue: entry.queue,
        total_wait_time: entry.total_wait_time,
        patient_count: entry.patient_count,
        record_pk: base64.encode(mfl_code + timestamp_unix + entry.queue),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('wait_time rows: %o', rows);
            await Waittime.bulkCreate(rows, {
                updateOnDuplicate: ['total_wait_time', 'patient_count', 'hie_facility_id']
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
