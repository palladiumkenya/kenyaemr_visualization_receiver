const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Payments } = require("../models/payments");
const { Revenue_by_department } = require("../models/revenue_by_department");

// Persist the payments dataset, fanning out to two tables (faithful to the legacy
// /superset route): payment_mode details -> payments, department details ->
// revenue_by_department. record_pk keeps the submission timestamp (periodic
// snapshot, no date in the payload).
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const base = {
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
    };

    const paymentModeRows = [];
    const departmentRows = [];

    (data || []).forEach((group) => {
        const details = (group.details || []).filter((d) => !_.isEmpty(d));

        if (group.category === "payment_mode") {
            details.forEach((detail) => {
                if (detail.payment_mode) {
                    paymentModeRows.push({
                        ...base,
                        payment_mode: detail.payment_mode,
                        no_of_patients: detail.no_of_patients,
                        amount_paid: detail.amount_paid,
                        record_pk: base64.encode(mfl_code + timestamp_unix + detail.payment_mode),
                    });
                }
            });
        } else if (group.category === "department") {
            details.forEach((detail) => {
                if (detail.department) {
                    departmentRows.push({
                        ...base,
                        department: detail.department,
                        patient_count: detail.patient_count ?? null,
                        amount: detail.amount ?? detail.amount_paid ?? null,
                        record_pk: base64.encode(mfl_code + timestamp_unix + detail.department),
                    });
                }
            });
        }
    });

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(paymentModeRows) === false) {
            logger.debug('payments (payment_mode) rows: %o', paymentModeRows);
            await Payments.bulkCreate(paymentModeRows, {
                updateOnDuplicate: ['no_of_patients', 'amount_paid', 'hie_facility_id']
            }, { transaction });
        }

        if (_.isEmpty(departmentRows) === false) {
            logger.debug('payments (department) rows: %o', departmentRows);
            await Revenue_by_department.bulkCreate(departmentRows, {
                updateOnDuplicate: ['patient_count', 'amount', 'hie_facility_id']
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
