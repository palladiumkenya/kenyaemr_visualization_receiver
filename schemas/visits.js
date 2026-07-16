const { z } = require("zod");

// Schema for the `data` array of a visits payload. Two category shapes:
//   { category: "visit_type", details: [{ visit_type, total, age_details: [{ age, total }] }] }
//   { category: "service_type", details: [{ service, total }] }
// Fields are optional (per the empty-data convention); the service dispatches by category.
const detailSchema = z.object({
    visit_type: z.string().min(1).optional(),
    service: z.string().min(1).optional(),
    total: z.coerce.number({ error: "total must be a number" }).int().nonnegative().optional(),
    age_details: z.array(
        z.object({
            age: z.string().min(1).optional(),
            total: z.coerce.number({ error: "age_details total must be a number" }).int().nonnegative().optional(),
        })
    ).optional(),
});

const visitsDataSchema = z.array(
    z.object({
        category: z.string().min(1).optional(),
        details: z.array(detailSchema).optional(),
    })
);

module.exports = { schema: visitsDataSchema };
