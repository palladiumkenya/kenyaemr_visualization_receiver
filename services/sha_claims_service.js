const sequelize = require("../db_config");
const base64 = require("base64util");
const _ = require("lodash");
const logger = require("../logger");

const { ShaClaims } = require("../models/sha_claims");

// Flatten the nested sha_claims payload into one row per
// (claim_date, scheme_code, status) and upsert. record_pk excludes the payload
// timestamp, so re-submissions for the same claim_date overwrite the prior row
// rather than accumulating a new one per submission.
async function handle({ data, facility_attributes, mfl_code, hie_facility_id, timestamp }) {
    const rows = [];

    (data || []).forEach((entry) => {
        const claim_date = entry.claim_date;
        (entry.schemes || []).forEach((scheme) => {
            const scheme_code = scheme.scheme_code;
            (scheme.statuses || []).forEach((statusEntry) => {
                // status is nullish-tolerant; normalise so null and undefined
                // produce the same record_pk and store as NULL.
                const status = statusEntry.status ?? null;
                rows.push({
                    timestamp: timestamp,
                    mfl_code: mfl_code,
                    hie_facility_id: hie_facility_id,
                    county: facility_attributes.county,
                    sub_county: facility_attributes.sub_county,
                    facility_name: facility_attributes.facility_name,
                    claim_date: claim_date,
                    scheme_code: scheme_code,
                    status: status,
                    count: statusEntry.count || 0,
                    amount: statusEntry.amount || 0,
                    record_pk: base64.encode(mfl_code + claim_date + scheme_code + (status ?? "")),
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
                // key fields (claim_date, scheme_code, status) are identical on
                // collision; refresh the values and the submission timestamp
                updateOnDuplicate: ['count', 'amount', 'timestamp', 'hie_facility_id']
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
