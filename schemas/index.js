const shaClaims = require("./sha_claims");
const loggedInUsersWithRoles = require("./logged_in_users_with_roles");
const workloadDepartment = require("./workload_department");
const waitTime = require("./wait_time");
const visits = require("./visits");
const waivers = require("./waivers");
const wardAdmissions = require("./ward_admissions");
const billing = require("./billing");
const diagnosis = require("./diagnosis");
const immunization = require("./immunization");
const inventory = require("./inventory");
const mortality = require("./mortality");
const payments = require("./payments");
const shaEnrollments = require("./sha_enrollments");
const deprecated = require("./deprecated");

// Registry of per-dataset_type `data` schemas, keyed by dataset_type.
// Add new dataset types here alongside their service.
module.exports = {
    sha_claims: shaClaims.schema,
    logged_in_users_with_roles: loggedInUsersWithRoles.schema,
    workload_department: workloadDepartment.schema,
    wait_time: waitTime.schema,
    visits: visits.schema,
    waivers: waivers.schema,
    ward_admissions: wardAdmissions.schema,
    billing: billing.schema,
    diagnosis: diagnosis.schema,
    immunization: immunization.schema,
    inventory: inventory.schema,
    mortality: mortality.schema,
    payments: payments.schema,
    sha_enrollments: shaEnrollments.schema,

    // Deprecated dataset types — data ignored, nothing persisted.
    workload: deprecated.schema,
    admissions_by_ward: deprecated.schema,
    admissions_by_age: deprecated.schema,
};
