const { z } = require("zod");

// Shared schema for deprecated dataset types whose data field is ignored.
const deprecatedDataSchema = z.array(z.any()).optional();

module.exports = { schema: deprecatedDataSchema };
