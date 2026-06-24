import React, { useEffect, useState } from 'react';
import { Calendar, UserPlus, Sparkles, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Scheduling() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState('');

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/schedules/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setError('');
    
    // Optimize for the next 7 days
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const end = futureDate.toISOString().split('T')[0];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/optimize?start_date=${today}&end_date=${end}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Optimization failed. Ensure forecast data exists first.');
      }

      const data = await response.json();
      setSchedules(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Published' })
      });
      if (response.ok) {
        fetchSchedules();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/schedules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSchedules(schedules.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Staff Schedules</h2>
          <p className="text-slate-400 mt-1">Manage shift assignments and auto-schedule using footfall forecasts</p>
        </div>
        
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="flex items-center gap-2 py-3 px-5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-lg shadow-brand-600/15 disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {optimizing ? 'Optimizing Shifts...' : 'Run Auto-Scheduler'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96">
          <Calendar className="w-8 h-8 text-brand-500 animate-pulse mb-4" />
          <p className="text-slate-400">Loading schedules...</p>
        </div>
      ) : schedules.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-12">
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 mb-6">
            <Calendar className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Active Shifts Scheduled</h3>
          <p className="text-slate-400 mb-8 max-w-md">
            Click below to auto-optimize shifts based on forecasted footfall numbers, allocating Sales Associates and Shift Leads where they are needed most.
          </p>
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            className="flex items-center gap-2 py-3 px-6 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-lg"
          >
            Run Auto-Scheduler
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Role / Shift</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Hours</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
                {schedules.map((s) => {
                  const shiftDate = new Date(s.shift_start);
                  const startTime = new Date(s.shift_start).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                  const endTime = new Date(s.shift_end).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                  
                  return (
                    <tr key={s.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">
                          {s.employee?.full_name || 'Unassigned User'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {s.employee?.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                          {s.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {shiftDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-6 font-mono">
                        {startTime} - {endTime}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === 'Published'
                            ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-800/40'
                            : 'bg-amber-950/55 text-amber-400 border border-amber-800/40'
                        }`}>
                          {s.status === 'Published' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {s.status === 'Draft' && (
                          <button
                            onClick={() => handlePublish(s.id)}
                            className="text-xs py-1.5 px-3 rounded bg-slate-800 border border-slate-700 hover:border-brand-500 text-slate-300 transition-all"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-800/60 transition-colors inline-flex align-middle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
