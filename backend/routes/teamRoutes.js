import express from "express";
import Team from "../models/Team.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/teams
router.post("/", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Team name is required" });

    const existing = await Team.findOne({ name });
    if (existing) return res.status(400).json({ message: "Team name already exists" });

    const team = await Team.create({ name, description });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teams
router.get("/", protect, async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/teams/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/teams/:id
router.put("/:id", protect, async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (name && name !== team.name) {
      const existing = await Team.findOne({ name });
      if (existing) return res.status(400).json({ message: "Team name already exists" });
      team.name = name;
    }
    
    if (description !== undefined) team.description = description;

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/teams/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    
    await team.deleteOne();
    res.json({ message: "Team removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
