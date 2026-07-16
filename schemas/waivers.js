const { z } = require("zod");

// Schema for the `data` array of a waivers payload: [{ waivers }]
// May be empty or contain an empty {} object when there are no waivers.
const waiversDataSchema = z.array(
    z.object({
        waivers: z.coerce.number({ error: "waivers must be a number" }).nonnegative().optional(),
    })
);

module.exports = { schema: waiversDataSchema };
