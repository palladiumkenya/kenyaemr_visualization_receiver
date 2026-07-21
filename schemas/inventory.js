const { z } = require("zod");

// Schema for the `data` array of an inventory payload:
// [{ item_name, item_type, unit_of_measure, quantity_at_hand, quantity_consumed }]
// Entries are aggregated by (item_type + item_name) in the service.
const inventoryDataSchema = z.array(
    z.object({
        item_name: z.string().min(1).optional(),
        item_type: z.string().min(1).optional(),
        unit_of_measure: z.string().min(1).optional(),
        quantity_at_hand: z.coerce.number({ error: "quantity_at_hand must be a number" }).int().nonnegative().optional(),
        quantity_consumed: z.coerce.number({ error: "quantity_consumed must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: inventoryDataSchema };
