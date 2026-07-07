const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { ShaClaims } = require("../models/sha_claims");

// Flatten the nested sha_claims payload into one row per
// (claim_date, scheme_code, status) and upsert. Duplicate combinations within a
// single payload collapse onto the same record_pk (last-wins).
async function handle({ data, facility_attributes, mfl_code, timestamp, timestamp_unix }) {
    const rows = [];

    (data || []).forEach((entry) => {
        const claim_date = entry.claim_date;
        (entry.schemes || []).forEach((scheme) => {
            const scheme_code = scheme.scheme_code;
            (scheme.statuses || []).forEach((statusEntry) => {
                const status = statusEntry.status;
                rows.push({
                    timestamp: timestamp,
                    mfl_code: mfl_code,
                    county: facility_attributes.county,
                    sub_county: facility_attributes.sub_county,
                    facility_name: facility_attributes.facility_name,
                    claim_date: claim_date,
                    scheme_code: scheme_code,
                    status: status,
                    count: statusEntry.count || 0,
                    amount: statusEntry.amount || 0,
                    record_pk: base64.encode(mfl_code + timestamp_unix + claim_date + scheme_code + status),
                });
            });
        });
    });

    let transaction;
    try {
        transaction = await sequelize.sequelize.transaction();

        if (_.isEmpty(rows) === false) {
            logger.debug('sha_claims rows: %o', rows);
            await ShaClaims.bulkCreate(rows, {
                updateOnDuplicate: ['count', 'amount', 'claim_date', 'scheme_code', 'status']
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
