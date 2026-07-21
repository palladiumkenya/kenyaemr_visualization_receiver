const { z } = require("zod");

// Schema for the `data` array of a staff_count payload: [{ staff, staff_count }]
const staffCountDataSchema = z.array(
    z.object({
        staff: z.string().min(1).optional(),
        staff_count: z.coerce.number({ error: "staff_count must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: staffCountDataSchema };
