const { z } = require("zod");

// Schema for the `data` array of an sha_claims payload:
// [{ claim_date, schemes: [{ scheme_code, statuses: [{ status, count, amount }] }] }]
const shaClaimsDataSchema = z.array(
    z.object({
        claim_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "claim_date must be YYYY-MM-DD"),
        schemes: z.array(
            z.object({
                scheme_code: z.string().min(1),
                statuses: z.array(
                    z.object({
                        status: z.string().min(1),
                        count: z.number().int().nonnegative(),
                        amount: z.number().nonnegative(),
                    })
                ).min(1),
            })
        ).min(1),
    })
).min(1, "data must contain at least one claim");

module.exports = { schema: shaClaimsDataSchema };
