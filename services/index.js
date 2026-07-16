const shaClaims = require("./sha_claims_service");
const loggedInUsersWithRoles = require("./logged_in_users_with_roles_service");
const workloadDepartment = require("./workload_department_service");
const workload = require("./workload_service");

// Registry of dataset services keyed by the payload's `dataset_type`.
// Add new dataset types here as a single entry.
module.exports = {
    sha_claims: shaClaims.handle,
    logged_in_users_with_roles: loggedInUsersWithRoles.handle,
    workload_department: workloadDepartment.handle,
    workload: workload.handle, // deprecated, replaced by workload_department
};
