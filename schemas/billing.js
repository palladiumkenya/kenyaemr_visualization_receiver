const { z } = require("zod");

// Schema for the `data` array of a billing payload:
// [{ service_type, invoices, amount_due, amount_paid, balance_due, total_refunds }]
// service_type may be an empty string; entries are aggregated by service_type in the service.
const billingDataSchema = z.array(
    z.object({
        service_type: z.string().optional(),
        invoices: z.coerce.number({ error: "invoices must be a number" }).int().nonnegative().optional(),
        amount_due: z.coerce.number({ error: "amount_due must be a number" }).nonnegative().optional(),
        amount_paid: z.coerce.number({ error: "amount_paid must be a number" }).nonnegative().optional(),
        balance_due: z.coerce.number({ error: "balance_due must be a number" }).nonnegative().optional(),
        total_refunds: z.coerce.number({ error: "total_refunds must be a number" }).nonnegative().optional(),
    })
);

module.exports = { schema: billingDataSchema };
