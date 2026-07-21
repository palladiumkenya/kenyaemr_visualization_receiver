const { z } = require("zod");

// Schema for the `data` array of a diagnosis payload: [{ diagnosis_name, total }]
const diagnosisDataSchema = z.array(
    z.object({
        diagnosis_name: z.string().min(1).optional(),
        total: z.coerce.number({ error: "total must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: diagnosisDataSchema };
