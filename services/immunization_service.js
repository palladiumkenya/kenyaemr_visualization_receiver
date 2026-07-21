const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Immunization } = require("../models/immunization");

// Persist immunization counts per vaccine. Reuses the pre-existing immunization
// model. The payload key is "Vaccine" (capitalised); it maps to `vaccine`.
// record_pk keyed on mfl_code + submission timestamp + vaccine.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        vaccine: entry.Vaccine,
        total: entry.total,
        record_pk: base64.encode(mfl_code + timestamp_unix + entry.Vaccine),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('immunization rows: %o', rows);
            await Immunization.bulkCreate(rows, {
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
