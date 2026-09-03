import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { CheckSquare, ArrowUpRight, Search, Plus, SearchX } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';

export default function MyTasksPage({ searchTerm }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const params = { view_type: 'my_tasks' };
      if (activeTab !== 'All') {
        params.status = activeTab;
      }
      const res = await taskAPI.getTasks(params);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [activeTab]);

  const tabs = ['All', 'Triage', 'Pending', 'Scheduled', 'In Progress', 'Completed'];

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

  const filteredTasks = searchTerm
    ? tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.task_id.toLowerCase().includes(searchTerm.toLowerCase()))
    : tasks;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-emerald-600" /> My Tasks
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tasks specifically assigned to your user account
          </p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-slate-100/70 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/80">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab 
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading My Tasks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Task</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Due Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 px-6 text-center">
                      <div className="max-w-sm mx-auto space-y-2">
                        <div className="h-10 w-10 bg-slate-100 text-slate-400 rounded-xl mx-auto flex items-center justify-center">
                          <SearchX className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-sm">No tasks found in "{activeTab}" status</h3>
                        <p className="text-xs text-slate-500">Switch tabs or clear your search to see assigned tasks.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">#{t.task_id}</span>
                          <span>{t.title}</span>
                        </div>
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
                          View Details <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchMyTasks()}
      />

    </div>
  );
}
