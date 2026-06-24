import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, UserPlus, Users, Sparkles, Check, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Staff');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  
  // Settings configs
  const [ratio, setRatio] = useState(50);
  const [morningStart, setMorningStart] = useState('09:00');
  const [morningEnd, setMorningEnd] = useState('17:00');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, full_name: fullName, role, is_active: true })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to create user');
      }

      setMsg('User created successfully!');
      setEmail('');
      setPassword('');
      setFullName('');
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-3xl font-extrabold text-white">System Settings</h2>
        <p className="text-slate-400 mt-1">Configure business constraints and manage employee registry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Constraints Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-brand-400">
            <SettingsIcon className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Scheduling Parameters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Staffing Ratio (1 employee per X visitors)
              </label>
              <input
                type="number"
                value={ratio}
                onChange={(e) => setRatio(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-500">Determines staff required based on footfall forecast.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Morning Shift Start
                </label>
                <input
                  type="text"
                  value={morningStart}
                  onChange={(e) => setMorningStart(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Morning Shift End
                </label>
                <input
                  type="text"
                  value={morningEnd}
                  onChange={(e) => setMorningEnd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-center"
                />
              </div>
            </div>
          </div>
          
          <button className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-all">
            Save Parameters
          </button>
        </div>

        {/* User Registration Form */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-brand-400">
            <UserPlus className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Add New Employee</h3>
          </div>

          {msg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              {msg}
            </div>
          )}
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Staff">Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@explorium.com"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-lg hover:shadow-brand-500/10 active:translate-y-px transition-all"
            >
              Register User
            </button>
          </form>
        </div>
      </div>

      {/* Users Registry List */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Users className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">Employee Directory</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-semibold text-white">{u.full_name || 'Anonymous User'}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-brand-950/60 text-brand-400 border border-brand-900/30">
                  {u.role}
                </span>
                <span className="text-[10px] text-slate-500">
                  ID: #{u.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
