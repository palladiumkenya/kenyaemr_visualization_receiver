const shaClaims = require("./sha_claims");

// Registry of per-dataset_type `data` schemas, keyed by dataset_type.
// Add new dataset types here alongside their service.
module.exports = {
    sha_claims: shaClaims.schema,
};
