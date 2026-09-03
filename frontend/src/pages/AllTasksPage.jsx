import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { ListTodo, ArrowUpRight, Filter as FilterIcon, SearchX, RotateCcw } from 'lucide-react';
import TaskFilterPanel from '../components/TaskFilterPanel';
import TaskDetailModal from '../components/TaskDetailModal';

export default function AllTasksPage({ searchTerm }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchAllTasks = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = { view_type: 'all_tasks', ...appliedFilters };
      if (searchTerm) params.search = searchTerm;
      const res = await taskAPI.getTasks(params);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks(filters);
  }, [filters, searchTerm]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-blue-600" /> All Tasks (Admin Directory)
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Complete task directory across all teams and status lifecycles
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-2 border rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm ${
              showFilterPanel 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <FilterIcon className="h-4 w-4" /> {showFilterPanel ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <TaskFilterPanel
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading Tasks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-5">Task</th>
                  <th className="py-3.5 px-5">Assigned To</th>
                  <th className="py-3.5 px-5">Team</th>
                  <th className="py-3.5 px-5">Priority</th>
                  <th className="py-3.5 px-5">Due Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 px-6 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
                          <SearchX className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-base">No tasks match filter criteria</h3>
                        <p className="text-xs text-slate-500">Try clearing status or priority filters to view available tasks.</p>
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Clear All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
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
                      <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                        {t.team_name || 'N/A'}
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
        onTaskUpdated={() => fetchAllTasks()}
      />

    </div>
  );
}
