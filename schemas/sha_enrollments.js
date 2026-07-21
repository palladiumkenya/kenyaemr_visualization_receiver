const { z } = require("zod");

// Schema for the `data` of an sha_enrollments payload. Unlike other dataset_types,
// `data` is a scalar count (e.g. 195), not an array. null/undefined is tolerated
// (no enrollment reported) and the service then persists nothing.
const shaEnrollmentsDataSchema = z.coerce
    .number({ error: "sha_enrollments data must be a number" })
    .nonnegative()
    .nullish();

module.exports = { schema: shaEnrollmentsDataSchema };
