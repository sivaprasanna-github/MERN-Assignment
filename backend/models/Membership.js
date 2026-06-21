import mongoose from "mongoose";

/**
 * Membership is the join entity that maps a User -> Team -> Role.
 *
 * This is the heart of the RBAC design:
 *   - A User has NO global role (no role field on the User model).
 *   - A User can hold a DIFFERENT role in each Team
 *       e.g. User A = Admin in Team Alpha, Viewer in Team Beta.
 *   - Permissions are always resolved through this mapping:
 *       User -> Membership(team) -> Role -> Permissions
 *   - If no Membership exists for a (user, team) pair, the user has
 *     no role in that team and therefore no permissions there.
 *
 * The unique compound index on (user, team) guarantees a user can only
 * have ONE active role per team (assigning a new role updates this record
 * instead of creating a conflicting duplicate).
 */
const membershipSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  { timestamps: true }
);

membershipSchema.index({ user: 1, team: 1 }, { unique: true });

export default mongoose.model("Membership", membershipSchema);
