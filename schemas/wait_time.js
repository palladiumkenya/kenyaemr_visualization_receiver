const { z } = require("zod");

// Schema for the `data` array of a wait_time payload:
// [{ queue, total_wait_time, patient_count }]
const waitTimeDataSchema = z.array(
    z.object({
        queue: z.string().min(1).optional(),
        total_wait_time: z.coerce.number({ error: "total_wait_time must be a number" }).nonnegative().optional(),
        patient_count: z.coerce.number({ error: "patient_count must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: waitTimeDataSchema };
