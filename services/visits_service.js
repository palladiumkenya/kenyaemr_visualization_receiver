const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Visits } = require("../models/visits");
const { OPD_Visits_Services } = require("../models/opd_visits_service");
const { OPD_Visits_Age } = require("../models/opd_visits_age");

// Persist the visits dataset, fanning out to three tables (faithful to the legacy
// /superset route): visit_type details -> visits, service_type details ->
// opd_visits, and Outpatient age_details -> opd_visits_age. record_pk keeps the
// submission timestamp (periodic snapshot, no date in the payload).
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const base = {
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
    };

    const visitTypeRows = [];
    const serviceRows = [];
    const ageRows = [];

    (data || []).forEach((group) => {
        const details = (group.details || []).filter((d) => !_.isEmpty(d));

        if (group.category === "visit_type") {
            details.forEach((detail) => {
                if (detail.visit_type) {
                    visitTypeRows.push({
                        ...base,
                        visit_type: detail.visit_type,
                        total: detail.total,
                        record_pk: base64.encode(mfl_code + timestamp_unix + detail.visit_type),
                    });
                }
                // Only Outpatient age breakdown goes to opd_visits_age (OPD-specific).
                if (detail.visit_type === "Outpatient") {
                    (detail.age_details || []).filter((a) => !_.isEmpty(a)).forEach((ageDetail) => {
                        if (ageDetail.age) {
                            ageRows.push({
                                ...base,
                                age: ageDetail.age,
                                total: ageDetail.total,
                                record_pk: base64.encode(mfl_code + timestamp_unix + ageDetail.age),
                            });
                        }
                    });
                }
            });
        } else if (group.category === "service_type") {
            details.forEach((detail) => {
                if (detail.service) {
                    serviceRows.push({
                        ...base,
                        service: detail.service,
                        total: detail.total,
                        record_pk: base64.encode(mfl_code + timestamp_unix + detail.service),
                    });
                }
            });
        }
    });

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(visitTypeRows) === false) {
            logger.debug('visits (visit_type) rows: %o', visitTypeRows);
            await Visits.bulkCreate(visitTypeRows, {
                updateOnDuplicate: ['total', 'hie_facility_id']
            }, { transaction });
        }

        if (_.isEmpty(serviceRows) === false) {
            logger.debug('visits (service_type) rows: %o', serviceRows);
            await OPD_Visits_Services.bulkCreate(serviceRows, {
                updateOnDuplicate: ['total', 'hie_facility_id']
            }, { transaction });
        }

        if (_.isEmpty(ageRows) === false) {
            logger.debug('visits (age) rows: %o', ageRows);
            await OPD_Visits_Age.bulkCreate(ageRows, {
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
