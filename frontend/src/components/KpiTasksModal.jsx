import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { X, Search, ArrowUpRight, Layers, Clock, Flame, CheckCircle2, SearchX, ExternalLink } from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

export default function KpiTasksModal({ isOpen, onClose, title, statusFilter, viewType = 'all_tasks' }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchFilteredTasks();
    }
  }, [isOpen, statusFilter, viewType]);

  const fetchFilteredTasks = async () => {
    try {
      setLoading(true);
      const params = { view_type: viewType };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const res = await taskAPI.getTasks(params);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleNavigateToPage = () => {
    onClose();
    if (viewType === 'my_tasks') {
      navigate('/my-tasks');
    } else if (viewType === 'team_tasks') {
      navigate('/team-tasks');
    } else {
      navigate('/all-tasks');
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border border-rose-200 font-bold';
      case 'High': return 'bg-orange-100 text-orange-700 border border-orange-200 font-bold';
      case 'Medium': return 'bg-amber-100 text-amber-700 border border-amber-200 font-bold';
      default: return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border border-blue-300 font-bold';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 border border-purple-300 font-bold';
      case 'Pending': return 'bg-amber-100 text-amber-800 border border-amber-300 font-bold';
      case 'Triage': return 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold';
      default: return 'bg-slate-100 text-slate-700 border border-slate-300 font-medium';
    }
  };

  const getHeaderIcon = () => {
    if (statusFilter === 'Completed') return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    if (statusFilter === 'In Progress' || statusFilter === 'In Progress,Scheduled') return <Flame className="h-5 w-5 text-blue-600" />;
    if (statusFilter === 'Pending' || statusFilter === 'Pending,Triage') return <Clock className="h-5 w-5 text-amber-600" />;
    return <Layers className="h-5 w-5 text-blue-600" />;
  };

  const filteredTasks = searchQuery ? tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.assignee_name && t.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : tasks;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
              {getHeaderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                  {filteredTasks.length} Tasks
                </span>
              </div>
              <p className="text-xs text-slate-500">Filtered view for quick task management</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNavigateToPage}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
            >
              Full Page <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Search Bar */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, ID, or assignee..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Modal Body - Tasks Table */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium text-xs">
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center space-y-2 max-w-sm mx-auto">
              <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
                <SearchX className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-700 text-sm">No tasks in "{title}"</h3>
              <p className="text-xs text-slate-500">There are currently no tasks matching this status criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Assigned To</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">#{t.task_id}</span>
                          <span>{t.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {t.assignee_name || 'Unassigned'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium">
                        {t.due_date || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedTaskId(t.id)}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          Details <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500">Showing {filteredTasks.length} tasks</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchFilteredTasks()}
      />

    </div>,
    document.body
  );
}
