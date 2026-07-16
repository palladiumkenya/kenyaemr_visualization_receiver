const { z } = require("zod");

// Shared envelope for every v2 dataset payload. The `data` field is validated
// per dataset_type by extending this schema in the controller.
const envelopeSchema = z.object({
    mfl_code: z.union([z.string(), z.number()], { error: "mfl_code is required and must be a string or number" }).transform(String),
    hie_facility_id: z.string({ error: "hie_facility_id must be a string" }).optional(),
    timestamp: z.string().regex(/^\d{14}$/, "timestamp must be 14 digits (YYYYMMDDHHMMSS)"),
    version: z.string().optional(),
    dataset_type: z.string().min(1, "dataset_type is required"),
});

module.exports = { envelopeSchema };
