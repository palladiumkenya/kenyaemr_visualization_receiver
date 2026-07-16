const { z } = require("zod");

// Schema for the `data` array of a logged_in_users_with_roles payload:
// [{ logged_in_users_with_roles, total_active_users_with_roles }]
// Values arrive as numeric strings, so they are coerced to non-negative integers.
const loggedInUsersWithRolesDataSchema = z.array(
    z.object({
        logged_in_users_with_roles: z.coerce.number({ error: "logged_in_users_with_roles must be a number" }).int().nonnegative().optional(),
        total_active_users_with_roles: z.coerce.number({ error: "total_active_users_with_roles must be a number" }).int().nonnegative().optional(),
    })
);

module.exports = { schema: loggedInUsersWithRolesDataSchema };
