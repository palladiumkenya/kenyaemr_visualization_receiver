const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Workload } = require("../models/workload");

// Persist workload counts per department per encounter_date. Reuses the
// pre-existing workload model. record_pk keyed on mfl_code + department +
// encounter_date, so re-submissions overwrite rather than accumulate.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp }) {
    const rows = [];

    (data || []).forEach((dept) => {
        const department = dept.department;
        (dept.data || []).filter((entry) => !_.isEmpty(entry)).forEach((entry) => {
            rows.push({
                timestamp: timestamp,
                mfl_code: mfl_code,
                hie_facility_id: hie_facility_id,
                county: facility_attributes.county,
                sub_county: facility_attributes.sub_county,
                facility_name: facility_attributes.facility_name,
                department: department,
                encounter_date: entry.encounter_date,
                total: entry.total,
                record_pk: base64.encode(mfl_code + department + entry.encounter_date),
            });
        });
    });

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('workload_department rows: %o', rows);
            await Workload.bulkCreate(rows, {
                updateOnDuplicate: ['total', 'timestamp', 'hie_facility_id']
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
