import React, { useEffect, useState } from "react";
import api from "../api/axios.js";

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

const Permissions = () => {
  const [permissions, setPermissions] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  
  const [form, setForm] = useState({ key: "", description: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(null);

  const fetchPermissions = async () => {
    try {
      const { data } = await api.get("/permissions");
      setPermissions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load permissions");
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const openCreate = () => {
    setEditingPermission(null);
    setForm({ key: "", description: "" });
    setError("");
    setMessage("");
    setIsModalOpen(true);
  };

  const openEdit = (permission) => {
    setEditingPermission(permission);
    setForm({
      key: permission.key,
      description: permission.description
    });
    setError("");
    setMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPermission(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingPermission) {
        await api.put(`/permissions/${editingPermission._id}`, form);
        setMessage("Permission updated successfully");
      } else {
        await api.post("/permissions", form);
        setMessage("Permission created successfully");
      }
      fetchPermissions();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;
    setIsDeleting(id);
    try {
      await api.delete(`/permissions/${id}`);
      setMessage("Permission deleted successfully");
      fetchPermissions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete permission");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Permissions</h1>
          <p className="text-slate-500 mt-1">Define atomic capabilities that can be assigned to roles.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm shadow-indigo-200 transition-all duration-200 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Permission
        </button>
      </div>

      {message && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in-down">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          <span className="font-medium text-sm">{message}</span>
        </div>
      )}
      
      {error && !isModalOpen && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {permissions.map((p) => {
          const colorClasses = COLORS[p.key] || "border-slate-200 bg-slate-50 text-slate-700";
          const icon = ICONS[p.key] || "🔑";

          return (
            <div key={p._id} className={`border rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden ${colorClasses}`}>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/50 backdrop-blur-sm rounded-lg p-1">
                <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-md hover:bg-white transition-colors" title="Edit Permission">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </button>
                <button onClick={() => handleDelete(p._id)} disabled={isDeleting === p._id} className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-white transition-colors disabled:opacity-50" title="Delete Permission">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
              <span className="text-3xl leading-none pt-1">{icon}</span>
              <div className="flex-1 min-w-0 pr-6">
                <p className="font-bold text-sm tracking-wide text-slate-800 truncate mb-1">{titleCase(p.key)}</p>
                <p className="text-xs font-mono bg-white/60 px-2 py-0.5 rounded inline-block mb-2">{p.key}</p>
                <p className="text-sm opacity-80 line-clamp-2 leading-snug">{p.description || "No description."}</p>
              </div>
            </div>
          );
        })}
        {permissions.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No permissions found</h3>
            <p className="mt-1 text-slate-500">Get started by creating a new atomic permission.</p>
            <button onClick={openCreate} className="mt-4 text-indigo-600 font-medium hover:text-indigo-700">
              Create your first permission &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Modal Backdrop & Content */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-800">
                {editingPermission ? "Edit Permission" : "Create New Permission"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  <span className="font-medium text-sm">{error}</span>
                </div>
              )}
              <form id="permission-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Permission Key <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DELETE_USERS"
                    value={form.key}
                    onChange={(e) => setForm({ ...form, key: e.target.value.toUpperCase() })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50 focus:bg-white font-mono text-sm uppercase"
                  />
                  <p className="text-xs text-slate-500 mt-1">Use uppercase letters and underscores.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea
                    rows="3"
                    placeholder="What does this permission allow?"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-slate-50 focus:bg-white resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="permission-form"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl px-6 py-2.5 shadow-sm shadow-indigo-200 transition-all duration-200"
              >
                {editingPermission ? "Save Changes" : "Create Permission"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global styles for custom scrollbar and animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}} />
    </div>
  );
};

export default Permissions;
