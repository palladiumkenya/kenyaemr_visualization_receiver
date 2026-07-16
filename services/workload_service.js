const logger = require("../logger");

// Deprecated: replaced by workload_department. Ignores the data field and
// persists nothing; only logs a warning that the deprecated dataset is in use.
async function handle({ facility_attributes, mfl_code }) {
    logger.warn(`Deprecated dataset_type 'workload' received (mfl_code: ${mfl_code}) — ignored; use 'workload_department'. No data persisted.`);
    return facility_attributes;
}

module.exports = { handle };
