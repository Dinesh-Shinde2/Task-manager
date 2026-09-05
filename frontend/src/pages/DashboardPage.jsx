import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI, userAPI } from '../services/api';
import { 
  Plus, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Flame, 
  Layers, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  FolderKanban, 
  Calendar, 
  ListFilter,
  Activity,
  UserCheck
} from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailModal from '../components/TaskDetailModal';

export default function DashboardPage({ searchTerm, setSearchTerm }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [summaryView, setSummaryView] = useState('my'); // 'my' or 'team'

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await reportAPI.getDashboardData();
      setDashboardData(res.data);

      if (user?.team_id) {
        try {
          const membersRes = await userAPI.getUsers(user.team_id);
          setTeamMembers(membersRes.data);
        } catch (e) {
          console.error(e);
        }
      }
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
      case 'Critical': return 'bg-rose-50 text-rose-700 border border-rose-200 font-bold';
      case 'High': return 'bg-orange-50 text-orange-700 border border-orange-200 font-bold';
      case 'Medium': return 'bg-amber-50 text-amber-700 border border-amber-200 font-bold';
      default: return 'bg-slate-50 text-slate-700 border border-slate-200 font-medium';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold';
      case 'In Progress': return 'bg-blue-50 text-blue-800 border border-blue-300 font-bold';
      case 'Scheduled': return 'bg-purple-50 text-purple-800 border border-purple-300 font-bold';
      case 'Pending': return 'bg-amber-50 text-amber-800 border border-amber-300 font-bold';
      case 'Triage': return 'bg-indigo-50 text-indigo-800 border border-indigo-300 font-bold';
      default: return 'bg-slate-50 text-slate-700 border border-slate-300 font-medium';
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-medium text-sm">Loading Executive Dashboard...</p>
      </div>
    );
  }

  const my = dashboardData?.my_tasks_summary || {};
  const team = dashboardData?.team_tasks_summary || {};
  const activeSummary = summaryView === 'my' ? my : team;
  const teamName = dashboardData?.team_name || 'Management';
  const recentTasks = dashboardData?.recent_tasks || [];

  const totalTasks = activeSummary.total || 0;
  const completedTasks = activeSummary.completed || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredRecentTasks = searchTerm ? recentTasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.task_id.toLowerCase().includes(searchTerm.toLowerCase())
  ) : recentTasks;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* ---------------------------------------------------------
          Top Welcome Header Card
         --------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Subtle decorative gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role || 'User'} Workspace
            </span>
            <span className="text-xs text-slate-400 font-medium">| {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
            Overview of your tasks, team workload, and recent activity logs.
          </p>
        </div>

        {/* Action Header Group */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Create New Task
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------
          Key Metric Cards (4 Executive KPI Cards)
         --------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Total Tasks Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-all relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{totalTasks}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {completionRate}% Done
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        {/* In Progress Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{activeSummary.in_progress || 0}</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Active Focus
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">+ {activeSummary.scheduled || 0} scheduled</p>
        </div>

        {/* Pending & Triage Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Action</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{(activeSummary.pending || 0) + (activeSummary.triage || 0)}</span>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Attention
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">{activeSummary.pending || 0} pending, {activeSummary.triage || 0} triage</p>
        </div>

        {/* Completed Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-black text-slate-900">{completedTasks}</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Finished
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 font-medium">Achieved task goals</p>
        </div>

      </div>

      {/* ---------------------------------------------------------
          Main Dashboard 2-Column Grid
         --------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2 Cols wide: Summary Tabs & Recent Tasks) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Breakdown Bar Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Status Lifecycles Breakdown</h3>
                <span className="text-xs font-semibold text-slate-500">({summaryView === 'my' ? 'My Tasks' : `Team: ${teamName}`})</span>
              </div>

              {/* View Selector Pills */}
              <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-bold">
                <button
                  onClick={() => setSummaryView('my')}
                  className={`px-3 py-1 rounded-lg transition-all ${summaryView === 'my' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  My Tasks
                </button>
                <button
                  onClick={() => setSummaryView('team')}
                  className={`px-3 py-1 rounded-lg transition-all ${summaryView === 'team' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Team Tasks
                </button>
              </div>
            </div>

            {/* Status Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{activeSummary.pending || 0}</span>
              </div>

              <div className="bg-purple-50/80 border border-purple-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Scheduled</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{activeSummary.scheduled || 0}</span>
              </div>

              <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Triage</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{activeSummary.triage || 0}</span>
              </div>

              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">In Progress</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{activeSummary.in_progress || 0}</span>
              </div>

              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-3 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">{activeSummary.completed || 0}</span>
              </div>

            </div>
          </div>

          {/* Recent Tasks Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Recent Active Tasks</h3>
                <p className="text-[11px] text-slate-500">Latest active tasks requiring team attention</p>
              </div>

              <button
                onClick={() => navigate('/all-tasks')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
              >
                View All Directory <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
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
                      <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                        No recent active tasks found.
                      </td>
                    </tr>
                  ) : (
                    filteredRecentTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">#{t.task_id}</span>
                            <span className="truncate max-w-[180px] sm:max-w-xs">{t.title}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 text-xs font-medium">
                          {t.assignee_name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getPriorityBadge(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                          {t.due_date || 'N/A'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${getStatusBadge(t.status)}`}>
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

        </div>

        {/* RIGHT COLUMN (1 Col wide: Quick Actions & Team Widget & System Status) */}
        <div className="space-y-6">
          
          {/* Quick Actions Shortcuts Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" /> Quick Actions
            </h3>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="w-full px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Create New Task
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => navigate('/my-tasks')}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" /> View My Tasks
                </span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>

              {user?.role === 'Admin' && (
                <>
                  <button
                    onClick={() => navigate('/teams')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-purple-600" /> Manage Teams
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => navigate('/reports')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-cyan-600" /> System Reports
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Team Members Widget */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" /> Team: {teamName}
              </h3>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                {teamMembers.length} Members
              </span>
            </div>

            <div className="space-y-2 pt-1">
              {teamMembers.length === 0 ? (
                <p className="text-xs text-slate-400 py-2 text-center">No members listed in team.</p>
              ) : (
                teamMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                        {m.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{m.name}</p>
                        <p className="text-[10px] text-slate-400">{m.role}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Environment Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">System Environment</h4>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-300">
              Role permissions, audit trails, and multi-team workflows are fully active.
            </p>
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Database Sync</span>
              <span className="text-emerald-400 font-bold">Online</span>
            </div>
          </div>

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
