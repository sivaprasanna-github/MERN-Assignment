import express from "express";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/roles
// @desc    Create a role, optionally with an initial array of permission ids
router.post("/", protect, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    if (!name) return res.status(400).json({ message: "Role name is required" });

    const existing = await Role.findOne({ name });
    if (existing) return res.status(400).json({ message: "Role already exists" });

    if (permissions && permissions.length) {
      const count = await Permission.countDocuments({ _id: { $in: permissions } });
      if (count !== permissions.length) {
        return res.status(400).json({ message: "One or more permission ids are invalid" });
      }
    }

    const role = await Role.create({ name, description, permissions: permissions || [] });
    const populated = await role.populate("permissions");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/roles/:id/permissions
// @desc    Assign (replace) the full set of permissions for a role
router.put("/:id/permissions", protect, async (req, res) => {
  try {
    const { permissions } = req.body;
    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "permissions must be an array of permission ids" });
    }

    const count = await Permission.countDocuments({ _id: { $in: permissions } });
    if (count !== permissions.length) {
      return res.status(400).json({ message: "One or more permission ids are invalid" });
    }

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { permissions },
      { new: true }
    ).populate("permissions");

    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/roles
router.get("/", protect, async (req, res) => {
  try {
    const roles = await Role.find().populate("permissions").sort({ name: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/roles/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).populate("permissions");
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/roles/:id
// @desc    Update a role's details and permissions
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });

    if (name && name !== role.name) {
      const existing = await Role.findOne({ name });
      if (existing) return res.status(400).json({ message: "Role name already exists" });
      role.name = name;
    }
    
    if (description !== undefined) role.description = description;

    if (permissions && Array.isArray(permissions)) {
      const count = await Permission.countDocuments({ _id: { $in: permissions } });
      if (count !== permissions.length) {
        return res.status(400).json({ message: "One or more permission ids are invalid" });
      }
      role.permissions = permissions;
    }

    await role.save();
    const populated = await role.populate("permissions");
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/roles/:id
// @desc    Delete a role
router.delete("/:id", protect, async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    
    await role.deleteOne();
    res.json({ message: "Role removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
