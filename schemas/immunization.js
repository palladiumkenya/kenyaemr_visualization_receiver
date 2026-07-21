const { z } = require("zod");

// Schema for the `data` array of an immunization payload: [{ Vaccine, total }]
// Note the payload key is capitalised "Vaccine"; the service maps it to `vaccine`.
const immunizationDataSchema = z.array(
    z.object({
        Vaccine: z.string().min(1).optional(),
        total: z.coerce.number({ error: "total must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: immunizationDataSchema };
