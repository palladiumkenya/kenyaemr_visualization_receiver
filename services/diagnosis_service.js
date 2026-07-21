const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Diagnosis } = require("../models/diagnosis");

// Persist diagnosis counts. Reuses the pre-existing diagnosis model.
// record_pk keyed on mfl_code + submission timestamp + diagnosis_name.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        diagnosis_name: entry.diagnosis_name,
        total: entry.total,
        record_pk: base64.encode(mfl_code + timestamp_unix + entry.diagnosis_name),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('diagnosis rows: %o', rows);
            await Diagnosis.bulkCreate(rows, {
                updateOnDuplicate: ['total', 'hie_facility_id']
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
