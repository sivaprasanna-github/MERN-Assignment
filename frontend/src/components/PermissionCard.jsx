import React from "react";

const ICONS = {
  CREATE_TASK: "➕",
  EDIT_TASK: "✏️",
  DELETE_TASK: "🗑️",
  VIEW_ONLY: "👁️",
};

const COLORS = {
  CREATE_TASK: "border-emerald-200 bg-emerald-50 text-emerald-700",
  EDIT_TASK: "border-amber-200 bg-amber-50 text-amber-700",
  DELETE_TASK: "border-red-200 bg-red-50 text-red-700",
  VIEW_ONLY: "border-sky-200 bg-sky-50 text-sky-700",
};

const titleCase = (key) =>
  key
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const PermissionCard = ({ permission }) => {
  const colorClasses = COLORS[permission.key] || "border-slate-200 bg-slate-50 text-slate-700";
  const icon = ICONS[permission.key] || "🔑";

  return (
    <div className={`border rounded-xl p-4 flex items-start gap-3 shadow-sm ${colorClasses}`}>
      <span className="text-2xl leading-none">{icon}</span>
      <div>
        <p className="font-semibold">{titleCase(permission.key)}</p>
        {permission.description && (
          <p className="text-xs opacity-80 mt-0.5">{permission.description}</p>
        )}
      </div>
    </div>
  );
};

export default PermissionCard;
