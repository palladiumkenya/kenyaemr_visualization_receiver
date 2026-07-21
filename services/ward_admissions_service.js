const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Admissions } = require("../models/admissions");

// Persist ward admissions per ward per encounter_date. Reuses the pre-existing
// admissions model. record_pk keyed on mfl_code + ward + encounter_date, so
// re-submissions overwrite rather than accumulate.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp }) {
    const rows = (data || []).map((entry) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        ward: entry.ward,
        encounter_date: entry.encounter_date,
        no_admissions: entry.no_admissions,
        no_discharges: entry.no_discharges,
        avg_length_of_stay_in_days: entry.avg_length_of_stay_in_days,
        no_deaths: entry.no_deaths,
        record_pk: base64.encode(mfl_code + (entry.ward ?? "") + (entry.encounter_date ?? "")),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('ward_admissions rows: %o', rows);
            await Admissions.bulkCreate(rows, {
                updateOnDuplicate: ['no_admissions', 'no_discharges', 'avg_length_of_stay_in_days', 'no_deaths', 'timestamp', 'hie_facility_id']
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
