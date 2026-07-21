const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Mortality } = require("../models/mortality");

// Persist mortality counts per cause_of_death. Reuses the pre-existing mortality
// model. record_pk keyed on mfl_code + submission timestamp + cause_of_death.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        cause_of_death: entry.cause_of_death,
        total: entry.total,
        record_pk: base64.encode(mfl_code + timestamp_unix + entry.cause_of_death),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('mortality rows: %o', rows);
            await Mortality.bulkCreate(rows, {
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
