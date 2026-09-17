import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { BarChart3, Users, FolderKanban } from 'lucide-react';

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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-slate-900" /> Executive Dashboard Reports
        </h1>
        <p className="text-slate-500 text-xs font-medium mt-0.5">
          High-level operational metrics, team performance, and individual user workload breakdown
        </p>
      </div>

      {/* Total Tasks Counter Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          System Overview
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 text-center">
          
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Total Tasks</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.total}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Pending</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.pending}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Triage</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.triage}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Scheduled</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.scheduled}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">In Progress</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.in_progress}</span>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-900 text-white">
            <span className="text-xs font-semibold text-slate-300 uppercase block">Completed</span>
            <span className="text-2xl font-bold text-white mt-1 block">{counts.completed}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase block">Deleted</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{counts.deleted}</span>
          </div>

        </div>
      </div>

      {/* Grid: Team Performance & User Workload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Team Performance Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-slate-900" /> Team Performance
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
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
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {tp.team_name}
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-900">
                      {tp.total}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-700 font-semibold">
                      {tp.pending}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-700 font-semibold">
                      {tp.in_progress}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-900 font-bold">
                      {tp.completed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Workload Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-900" /> User Workload
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800">
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
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {uw.user_name}
                      <span className="text-[10px] text-slate-400 font-medium block font-mono">{uw.user_id}</span>
                    </td>
                    <td className="py-3.5 px-5 text-center font-bold text-slate-900">
                      {uw.assigned}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-700 font-semibold">
                      {uw.pending}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-700 font-semibold">
                      {uw.in_progress}
                    </td>
                    <td className="py-3.5 px-5 text-center text-slate-900 font-bold">
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
