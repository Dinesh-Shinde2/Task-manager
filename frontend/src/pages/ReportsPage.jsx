import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { BarChart3, Users, FolderKanban, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getAdminMetrics()
      .then(res => setMetrics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-medium">Loading Executive Reports...</div>;
  }

  const counts = metrics?.status_counts || {};
  const teamPerf = metrics?.team_performance || [];
  const userWorkload = metrics?.user_workload || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-teal-600" /> Executive Dashboard Reports
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          High-level operational metrics, team performance, and individual user workload breakdown
        </p>
      </div>

      {/* Total Tasks Counter Grid matching Section 18 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          System Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Total Tasks</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.total}</span>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <span className="text-xs font-semibold text-amber-700 uppercase block">Pending</span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">{counts.pending}</span>
          </div>

          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <span className="text-xs font-semibold text-indigo-700 uppercase block">Triage</span>
            <span className="text-2xl font-bold text-indigo-700 mt-1 block">{counts.triage}</span>
          </div>

          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <span className="text-xs font-semibold text-purple-700 uppercase block">Scheduled</span>
            <span className="text-2xl font-bold text-purple-700 mt-1 block">{counts.scheduled}</span>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <span className="text-xs font-semibold text-blue-700 uppercase block">In Progress</span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block">{counts.in_progress}</span>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <span className="text-xs font-semibold text-emerald-700 uppercase block">Completed</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">{counts.completed}</span>
          </div>

          <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
            <span className="text-xs font-semibold text-rose-700 uppercase block">Deleted</span>
            <span className="text-2xl font-bold text-rose-700 mt-1 block">{counts.deleted}</span>
          </div>

        </div>
      </div>

      {/* Grid: Team Performance & User Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Team Performance Table matching Section 18 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-purple-600" /> Team Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-5">Team</th>
                  <th className="py-3 px-5 text-center">Total</th>
                  <th className="py-3 px-5 text-center">Pending</th>
                  <th className="py-3 px-5 text-center">Progress</th>
                  <th className="py-3 px-5 text-center">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamPerf.map((tp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {tp.team_name}
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      {tp.total}
                    </td>
                    <td className="py-3.5 px-5 text-center text-amber-600 font-semibold">
                      {tp.pending}
                    </td>
                    <td className="py-3.5 px-5 text-center text-blue-600 font-semibold">
                      {tp.in_progress}
                    </td>
                    <td className="py-3.5 px-5 text-center text-emerald-600 font-semibold">
                      {tp.completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Workload Table matching Section 18 */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" /> User Workload
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-5 text-center">Assigned</th>
                  <th className="py-3 px-5 text-center">Pending</th>
                  <th className="py-3 px-5 text-center">In Progress</th>
                  <th className="py-3 px-5 text-center">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userWorkload.map((uw, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {uw.user_name}
                      <span className="text-xs text-slate-400 font-normal block font-mono">{uw.user_id}</span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-700">
                      {uw.assigned}
                    </td>
                    <td className="py-3.5 px-5 text-center text-amber-600 font-semibold">
                      {uw.pending}
                    </td>
                    <td className="py-3.5 px-5 text-center text-blue-600 font-semibold">
                      {uw.in_progress}
                    </td>
                    <td className="py-3.5 px-5 text-center text-emerald-600 font-semibold">
                      {uw.completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
