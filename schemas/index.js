const shaClaims = require("./sha_claims");
const loggedInUsersWithRoles = require("./logged_in_users_with_roles");

// Registry of per-dataset_type `data` schemas, keyed by dataset_type.
// Add new dataset types here alongside their service.
module.exports = {
    sha_claims: shaClaims.schema,
    logged_in_users_with_roles: loggedInUsersWithRoles.schema,
};
