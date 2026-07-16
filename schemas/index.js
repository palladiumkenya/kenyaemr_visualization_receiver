const shaClaims = require("./sha_claims");
const loggedInUsersWithRoles = require("./logged_in_users_with_roles");
const workloadDepartment = require("./workload_department");
const workload = require("./workload");
const waitTime = require("./wait_time");
const visits = require("./visits");
const waivers = require("./waivers");

// Registry of per-dataset_type `data` schemas, keyed by dataset_type.
// Add new dataset types here alongside their service.
module.exports = {
    sha_claims: shaClaims.schema,
    logged_in_users_with_roles: loggedInUsersWithRoles.schema,
    workload_department: workloadDepartment.schema,
    workload: workload.schema, // deprecated, replaced by workload_department
    wait_time: waitTime.schema,
    visits: visits.schema,
    waivers: waivers.schema,
};
