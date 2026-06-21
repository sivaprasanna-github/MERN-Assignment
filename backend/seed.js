import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Permission from "./models/Permission.js";
import Role from "./models/Role.js";

dotenv.config();

const PERMISSIONS = [
  { key: "CREATE_TASK", description: "Can create new tasks" },
  { key: "EDIT_TASK", description: "Can edit existing tasks" },
  { key: "DELETE_TASK", description: "Can delete tasks" },
  { key: "VIEW_ONLY", description: "Can only view content, no modifications" },
];

const ROLES = [
  { name: "Admin", description: "Full access", permissionKeys: ["CREATE_TASK", "EDIT_TASK", "DELETE_TASK", "VIEW_ONLY"] },
  { name: "Manager", description: "Can manage tasks but not delete", permissionKeys: ["CREATE_TASK", "EDIT_TASK", "VIEW_ONLY"] },
  { name: "Viewer", description: "Read-only access", permissionKeys: ["VIEW_ONLY"] },
];

const run = async () => {
  await connectDB();

  const permissionDocs = {};
  for (const p of PERMISSIONS) {
    const doc = await Permission.findOneAndUpdate(
      { key: p.key },
      { key: p.key, description: p.description },
      { upsert: true, new: true }
    );
    permissionDocs[p.key] = doc._id;
  }
  console.log("Permissions seeded:", Object.keys(permissionDocs));

  for (const r of ROLES) {
    const permissionIds = r.permissionKeys.map((k) => permissionDocs[k]);
    await Role.findOneAndUpdate(
      { name: r.name },
      { name: r.name, description: r.description, permissions: permissionIds },
      { upsert: true, new: true }
    );
  }
  console.log("Roles seeded:", ROLES.map((r) => r.name));

  console.log("Seeding complete.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
