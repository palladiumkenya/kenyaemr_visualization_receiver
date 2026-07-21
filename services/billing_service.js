const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { Billing } = require("../models/billing");

// Persist billing totals per service_type. Reuses the pre-existing billing model.
// Multiple payload entries with the same service_type are aggregated (summed).
// record_pk keyed on mfl_code + submission timestamp + service_type.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp, timestamp_unix }) {
    const totals = {};

    (data || []).forEach((entry) => {
        const service_type = entry.service_type ?? "";
        if (!totals[service_type]) {
            totals[service_type] = { invoices_total: 0, amount_due: 0, amount_paid: 0, balance_due: 0, refund: 0 };
        }
        const agg = totals[service_type];
        agg.invoices_total += entry.invoices || 0;
        agg.amount_due += entry.amount_due || 0;
        agg.amount_paid += entry.amount_paid || 0;
        agg.balance_due += entry.balance_due || 0;
        agg.refund += entry.total_refunds || 0;
    });

    const rows = Object.entries(totals).map(([service_type, agg]) => ({
        timestamp: timestamp,
        mfl_code: mfl_code,
        hie_facility_id: hie_facility_id,
        county: facility_attributes.county,
        sub_county: facility_attributes.sub_county,
        facility_name: facility_attributes.facility_name,
        service_type: service_type,
        invoices_total: agg.invoices_total,
        amount_due: agg.amount_due,
        amount_paid: agg.amount_paid,
        balance_due: agg.balance_due,
        refund: agg.refund,
        record_pk: base64.encode(mfl_code + timestamp_unix + service_type),
    }));

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('billing rows: %o', rows);
            await Billing.bulkCreate(rows, {
                updateOnDuplicate: ['invoices_total', 'amount_due', 'amount_paid', 'balance_due', 'refund', 'hie_facility_id']
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
