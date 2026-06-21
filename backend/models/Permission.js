import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: [true, "Permission key is required"],
      unique: true,
      uppercase: true,
      trim: true,
      // e.g. CREATE_TASK, EDIT_TASK, DELETE_TASK, VIEW_ONLY
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Permission", permissionSchema);
