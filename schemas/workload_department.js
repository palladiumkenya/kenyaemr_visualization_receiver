const { z } = require("zod");

// Schema for the `data` array of a workload_department payload:
// [{ department, data: [{ encounter_date, total }] }]
const workloadDepartmentDataSchema = z.array(
    z.object({
        department: z.string().min(1).optional(),
        data: z.array(
            z.object({
                encounter_date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "encounter_date must be YYYY-MM-DD HH:MM:SS").optional(),
                total: z.coerce.number({ error: "total must be a number" }).int().nonnegative().optional(),
            })
        ).optional(),
    })
);

module.exports = { schema: workloadDepartmentDataSchema };
