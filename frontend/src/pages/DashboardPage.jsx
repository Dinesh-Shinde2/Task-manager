import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { reportAPI } from '../services/api';
import { Plus, Search, Calendar, User, Clock, AlertCircle, ArrowUpRight, CheckCircle2, Flame, Layers } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

export default function DashboardPage({ searchTerm, setSearchTerm }) {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getDashboardData();
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border border-rose-200 font-semibold';
      case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200 font-semibold';
      case 'Medium': return 'bg-amber-100 text-amber-700 border border-amber-200 font-semibold';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border border-blue-300 font-semibold';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 border border-purple-300 font-semibold';
      case 'Pending': return 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold';
      case 'Triage': return 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-semibold';
      default: return 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold';
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-medium">Loading Dashboard...</div>;
  }

  const my = dashboardData?.my_tasks_summary || {};
  const team = dashboardData?.team_tasks_summary || {};
  const teamName = dashboardData?.team_name || 'Management';
  const recentTasks = dashboardData?.recent_tasks || [];

  const filteredRecentTasks = searchTerm ? recentTasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.task_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) : recentTasks;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Banner / Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-blue-600/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur">
            Overview Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold mt-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-xl">
            Here is a real-time summary of your personal and team workflows.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-3 bg-white hover:bg-blue-50 text-blue-700 font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Create New Task
        </button>
      </div>

      {/* ---------------------------------------------------------
          My Tasks Summary Counters
         --------------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> My Tasks Overview
          </h2>
          <span className="text-xs text-slate-400 font-medium">Assigned specifically to you</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          
          <div className="bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2 block">{my.pending}</span>
          </div>

          <div className="bg-white border-t-4 border-t-purple-500 border-x border-b border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scheduled</span>
              <Calendar className="h-4 w-4 text-purple-500" />
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2 block">{my.scheduled}</span>
          </div>

          <div className="bg-white border-t-4 border-t-indigo-500 border-x border-b border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Triage</span>
              <Layers className="h-4 w-4 text-indigo-500" />
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2 block">{my.triage}</span>
          </div>

          <div className="bg-white border-t-4 border-t-blue-500 border-x border-b border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">In Progress</span>
              <Flame className="h-4 w-4 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2 block">{my.in_progress}</span>
          </div>

          <div className="bg-white border-t-4 border-t-emerald-500 border-x border-b border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-bold text-slate-800 mt-2 block">{my.completed}</span>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------
          Team Tasks Summary Counters
         --------------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span> Team Tasks Breakdown
          </h2>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Team: {teamName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{team.pending}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Scheduled</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{team.scheduled}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Triage</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{team.triage}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">In Progress</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{team.in_progress}</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Completed</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{team.completed}</span>
          </div>

        </div>
      </div>

      {/* ---------------------------------------------------------
          Recent Tasks Table
         --------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-base">Recent Tasks</h2>
          <span className="text-xs text-slate-400 font-medium">Top 5 recent active tasks</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-5">Task</th>
                <th className="py-3.5 px-5">Assigned To</th>
                <th className="py-3.5 px-5">Priority</th>
                <th className="py-3.5 px-5">Due Date</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecentTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                    No recent tasks found.
                  </td>
                </tr>
              ) : (
                filteredRecentTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">#{t.task_id}</span>
                        <span>{t.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {t.assignee_name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                      {t.due_date || 'N/A'}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => setSelectedTaskId(t.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-0.5 justify-end ml-auto"
                      >
                        View <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={() => fetchDashboard()}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchDashboard()}
      />

    </div>
  );
}
