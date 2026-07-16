const { z } = require("zod");

// Deprecated dataset_type, replaced by workload_department. The data field is
// ignored, so accept any array without validating its contents.
const workloadDataSchema = z.array(z.any()).optional();

module.exports = { schema: workloadDataSchema };
