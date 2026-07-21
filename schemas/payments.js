const { z } = require("zod");

// Schema for the `data` array of a payments payload. Two category shapes:
//   { category: "payment_mode", details: [{ payment_mode, no_of_patients, amount_paid }] }
//   { category: "department",   details: [{ department, patient_count?, amount_paid|amount }] }
// Fields are optional (per the empty-data convention); the service dispatches by category.
const detailSchema = z.object({
    payment_mode: z.string().min(1).optional(),
    no_of_patients: z.coerce.number({ error: "no_of_patients must be a number" }).int().nonnegative().optional(),
    amount_paid: z.coerce.number({ error: "amount_paid must be a number" }).nonnegative().optional(),
    department: z.string().min(1).optional(),
    patient_count: z.coerce.number({ error: "patient_count must be a number" }).int().nonnegative().optional(),
    amount: z.coerce.number({ error: "amount must be a number" }).nonnegative().optional(),
});

const paymentsDataSchema = z.array(
    z.object({
        category: z.string().min(1).optional(),
        details: z.array(detailSchema).optional(),
    })
);

module.exports = { schema: paymentsDataSchema };
