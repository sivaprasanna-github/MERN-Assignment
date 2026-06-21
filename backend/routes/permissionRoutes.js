import express from "express";
import Permission from "../models/Permission.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/permissions
// @desc    Create a permission, e.g. { key: "CREATE_TASK", description: "..." }
router.post("/", protect, async (req, res) => {
  try {
    const { key, description } = req.body;
    if (!key) return res.status(400).json({ message: "Permission key is required" });

    const normalizedKey = key.toUpperCase().trim();
    const existing = await Permission.findOne({ key: normalizedKey });
    if (existing) return res.status(400).json({ message: "Permission already exists" });

    const permission = await Permission.create({ key: normalizedKey, description });
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/permissions
router.get("/", protect, async (req, res) => {
  try {
    const permissions = await Permission.find().sort({ key: 1 });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/permissions/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const { key, description } = req.body;
    const permission = await Permission.findById(req.params.id);
    if (!permission) return res.status(404).json({ message: "Permission not found" });

    if (key && key.toUpperCase().trim() !== permission.key) {
      const normalizedKey = key.toUpperCase().trim();
      const existing = await Permission.findOne({ key: normalizedKey });
      if (existing) return res.status(400).json({ message: "Permission key already exists" });
      permission.key = normalizedKey;
    }
    
    if (description !== undefined) permission.description = description;

    await permission.save();
    res.json(permission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/permissions/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) return res.status(404).json({ message: "Permission not found" });
    
    await permission.deleteOne();
    res.json({ message: "Permission removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
