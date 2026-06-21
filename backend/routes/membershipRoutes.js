import express from "express";
import Membership from "../models/Membership.js";
import User from "../models/User.js";
import Team from "../models/Team.js";
import Role from "../models/Role.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/memberships
// @desc    List all memberships (optionally filter by team or user), fully populated
router.get("/", protect, async (req, res) => {
  try {
    const { team, user } = req.query;
    const filter = {};
    if (team) filter.team = team;
    if (user) filter.user = user;

    const memberships = await Membership.find(filter)
      .populate("user", "name email")
      .populate("team", "name description")
      .populate({ path: "role", populate: { path: "permissions" } })
      .sort({ createdAt: -1 });

    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/memberships
// @desc    Add a user to a team with a role (a.k.a. assign role to user within a team).
//          If the user is already in that team, this updates their role instead
//          of creating a duplicate (upsert), since a user has exactly one role
//          per team but can have different roles across different teams.
router.post("/", protect, async (req, res) => {
  try {
    const { user, team, role } = req.body;
    if (!user || !team || !role) {
      return res.status(400).json({ message: "user, team and role are all required" });
    }

    const [userExists, teamExists, roleExists] = await Promise.all([
      User.findById(user),
      Team.findById(team),
      Role.findById(role),
    ]);

    if (!userExists) return res.status(404).json({ message: "User not found" });
    if (!teamExists) return res.status(404).json({ message: "Team not found" });
    if (!roleExists) return res.status(404).json({ message: "Role not found" });

    const membership = await Membership.findOneAndUpdate(
      { user, team },
      { user, team, role },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
      .populate("user", "name email")
      .populate("team", "name description")
      .populate({ path: "role", populate: { path: "permissions" } });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/memberships/:id
// @desc    Update an existing membership's role assignment
router.put("/:id", protect, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: "role is required" });

    const roleExists = await Role.findById(role);
    if (!roleExists) return res.status(404).json({ message: "Role not found" });

    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    )
      .populate("user", "name email")
      .populate("team", "name description")
      .populate({ path: "role", populate: { path: "permissions" } });

    if (!membership) return res.status(404).json({ message: "Membership not found" });
    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/memberships/:id
// @desc    Remove a user from a team (delete the membership / role assignment)
router.delete("/:id", protect, async (req, res) => {
  try {
    const membership = await Membership.findByIdAndDelete(req.params.id);
    if (!membership) return res.status(404).json({ message: "Membership not found" });
    res.json({ message: "User removed from team" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/memberships/permissions/:userId/:teamId
// @desc    PERMISSION RESOLUTION - the core of the RBAC system.
//          Looks up the user's role within the specific team and returns
//          that role's permissions. If no membership/role exists for this
//          (user, team) pair, the user has NO permissions in that team.
router.get("/permissions/:userId/:teamId", protect, async (req, res) => {
  try {
    const { userId, teamId } = req.params;

    const membership = await Membership.findOne({ user: userId, team: teamId }).populate({
      path: "role",
      populate: { path: "permissions" },
    });

    if (!membership || !membership.role) {
      return res.json({
        user: userId,
        team: teamId,
        role: null,
        permissions: [],
      });
    }

    res.json({
      user: userId,
      team: teamId,
      role: { _id: membership.role._id, name: membership.role.name },
      permissions: membership.role.permissions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
