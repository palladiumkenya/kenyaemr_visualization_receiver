const logger = require("../logger");

// Builds a handler for a deprecated dataset_type: ignores the data field and
// persists nothing, only warning that the deprecated dataset is still in use.
function deprecated(dataset_type, replacement) {
    return async function handle({ facility_attributes, mfl_code }) {
        const advice = replacement ? ` Use '${replacement}' instead.` : "";
        logger.warn(`Deprecated dataset_type '${dataset_type}' received (mfl_code: ${mfl_code}) — ignored, no data persisted.${advice}`);
        return facility_attributes;
    };
}

module.exports = { deprecated };
