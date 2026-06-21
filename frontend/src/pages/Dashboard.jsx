import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import api from "../api/axios.js";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#f43f5e"];

const StatCard = ({ title, value, icon, colorClass, delay }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4 animate-fade-in-up hover:shadow-md transition-shadow`} style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}>
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shadow-sm ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
      <h3 className="text-3xl font-extrabold text-slate-800">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [memberships, setMemberships] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [resolution, setResolution] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [resolverLoading, setResolverLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const [usersRes, teamsRes, rolesRes, permsRes, memRes] = await Promise.all([
          api.get("/users"),
          api.get("/teams"),
          api.get("/roles"),
          api.get("/permissions"),
          api.get("/memberships")
        ]);
        
        setUsers(usersRes.data);
        setTeams(teamsRes.data);
        setRoles(rolesRes.data);
        setPermissions(permsRes.data);
        setMemberships(memRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchOverviewData();
  }, []);

  const usersPerTeamData = useMemo(() => {
    const teamCounts = {};
    teams.forEach(t => teamCounts[t.name] = 0);
    memberships.forEach(m => {
      if (m.team && m.team.name) {
        teamCounts[m.team.name] = (teamCounts[m.team.name] || 0) + 1;
      }
    });
    return Object.keys(teamCounts).map(name => ({
      name,
      Users: teamCounts[name]
    })).sort((a, b) => b.Users - a.Users);
  }, [teams, memberships]);

  const roleDistributionData = useMemo(() => {
    const roleCounts = {};
    memberships.forEach(m => {
      if (m.role && m.role.name) {
        roleCounts[m.role.name] = (roleCounts[m.role.name] || 0) + 1;
      }
    });
    return Object.keys(roleCounts).map(name => ({
      name,
      value: roleCounts[name]
    })).sort((a, b) => b.value - a.value);
  }, [memberships]);

  useEffect(() => {
    const resolvePermissions = async () => {
      if (!selectedUser || !selectedTeam) {
        setResolution(null);
        return;
      }
      setResolverLoading(true);
      try {
        const { data } = await api.get(`/memberships/permissions/${selectedUser}/${selectedTeam}`);
        setResolution(data);
      } catch (err) {
        console.error("Failed to resolve permissions", err);
      } finally {
        setResolverLoading(false);
      }
    };
    resolvePermissions();
  }, [selectedUser, selectedTeam]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Loading dashboard metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
        <p className="text-slate-500 mt-1">Key metrics and analytics for your RBAC system.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
          <span className="font-medium text-sm">{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={users.length} 
          icon="👥" 
          colorClass="bg-blue-50 text-blue-600 border border-blue-100" 
          delay={100} 
        />
        <StatCard 
          title="Total Teams" 
          value={teams.length} 
          icon="🏢" 
          colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100" 
          delay={200} 
        />
        <StatCard 
          title="Total Roles" 
          value={roles.length} 
          icon="🛡️" 
          colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" 
          delay={300} 
        />
        <StatCard 
          title="Permissions" 
          value={permissions.length} 
          icon="🔑" 
          colorClass="bg-amber-50 text-amber-600 border border-amber-100" 
          delay={400} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
          <h2 className="text-lg font-bold text-slate-800 mb-6">Users per Team</h2>
          <div className="h-80 w-full">
            {usersPerTeamData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usersPerTeamData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="Users" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-fade-in-up" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          <h2 className="text-lg font-bold text-slate-800 mb-6">Role Distribution</h2>
          <div className="h-80 w-full flex items-center justify-center relative">
            {roleDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleDistributionData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {roleDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
            
            {/* Center text for donut hole */}
            {roleDistributionData.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-slate-800">{memberships.length}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Assigns</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Permission Resolver Section */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '700ms', animationFillMode: 'both' }}>
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Permission Resolver</h2>
            <p className="text-indigo-200">
              Select a user and a team to dynamically resolve their effective permissions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
            <div>
              <label className="block text-sm font-medium text-indigo-100 mb-2">User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full bg-white/5 border border-indigo-300/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="" className="text-slate-800">-- Select a user --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id} className="text-slate-800">
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-100 mb-2">Team</label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-white/5 border border-indigo-300/30 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 appearance-none"
                style={{ WebkitAppearance: 'none' }}
              >
                <option value="" className="text-slate-800">-- Select a team --</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id} className="text-slate-800">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="min-h-[150px]">
            {!selectedUser || !selectedTeam ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-indigo-200 text-sm">Select both parameters to view permissions</p>
              </div>
            ) : resolverLoading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 border-3 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
              </div>
            ) : resolution && resolution.permissions.length > 0 ? (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-indigo-200 font-medium">Assigned Role:</span>
                  <span className="bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase shadow-inner">
                    {resolution.role.name}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {resolution.permissions.map((p) => (
                    <div key={p._id} className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:bg-white/15 transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white font-mono text-xs">
                          {p.key.charAt(0)}
                        </div>
                        <p className="font-bold text-white text-sm truncate" title={p.key}>{p.key}</p>
                      </div>
                      <p className="text-indigo-200/80 text-xs line-clamp-2">{p.description || "No description"}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 bg-black/20 rounded-2xl border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400/80 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-white font-medium">Access Denied</p>
                <p className="text-indigo-200/70 text-sm mt-1">This user has no role assigned in this team.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
