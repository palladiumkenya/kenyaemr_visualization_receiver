const { z } = require("zod");

// Schema for the `data` array of a mortality payload: [{ cause_of_death, total }]
const mortalityDataSchema = z.array(
    z.object({
        cause_of_death: z.string().min(1).optional(),
        total: z.coerce.number({ error: "total must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: mortalityDataSchema };
