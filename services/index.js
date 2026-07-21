const shaClaims = require("./sha_claims_service");
const loggedInUsersWithRoles = require("./logged_in_users_with_roles_service");
const workloadDepartment = require("./workload_department_service");
const waitTime = require("./wait_time_service");
const visits = require("./visits_service");
const waivers = require("./waivers_service");
const wardAdmissions = require("./ward_admissions_service");
const { deprecated } = require("./deprecated_service");

// Registry of dataset services keyed by the payload's `dataset_type`.
// Add new dataset types here as a single entry.
module.exports = {
    sha_claims: shaClaims.handle,
    logged_in_users_with_roles: loggedInUsersWithRoles.handle,
    workload_department: workloadDepartment.handle,
    wait_time: waitTime.handle,
    visits: visits.handle,
    waivers: waivers.handle,
    ward_admissions: wardAdmissions.handle,

    // Deprecated dataset types — data ignored, nothing persisted.
    workload: deprecated("workload", "workload_department"),
    admissions_by_ward: deprecated("admissions_by_ward", "ward_admissions"),
    admissions_by_age: deprecated("admissions_by_age", "ward_admissions"),
};
