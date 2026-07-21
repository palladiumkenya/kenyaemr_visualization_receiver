const { z } = require("zod");

// Schema for the `data` array of a ward_admissions payload:
// [{ encounter_date, ward, no_admissions, no_discharges, avg_length_of_stay_in_days, no_deaths }]
const wardAdmissionsDataSchema = z.array(
    z.object({
        encounter_date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, "encounter_date must be YYYY-MM-DD HH:MM:SS").optional(),
        ward: z.string().min(1).optional(),
        no_admissions: z.coerce.number({ error: "no_admissions must be a number" }).int().nonnegative().optional(),
        no_discharges: z.coerce.number({ error: "no_discharges must be a number" }).int().nonnegative().optional(),
        avg_length_of_stay_in_days: z.coerce.number({ error: "avg_length_of_stay_in_days must be a number" }).nonnegative().optional(),
        no_deaths: z.coerce.number({ error: "no_deaths must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: wardAdmissionsDataSchema };
