import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { taskAPI, userAPI } from '../services/api';
import { 
  X, 
  Search, 
  ArrowUpRight, 
  Layers, 
  Clock, 
  Flame, 
  CheckCircle2, 
  SearchX, 
  ExternalLink,
  ChevronDown,
  User as UserIcon,
  Trash2,
  Sparkles
} from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';
import TaskTimerBadge from './TaskTimerBadge';

export default function KpiTasksModal({ isOpen, onClose, title, statusFilter, viewType = 'all_tasks' }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchFilteredTasks();
      fetchUsersList();
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

  const fetchUsersList = async () => {
    try {
      const res = await userAPI.getUsers();
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await taskAPI.updateTask(taskId, { status: newStatus });
      fetchFilteredTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleAssigneeChange = async (taskId, newAssigneeId) => {
    try {
      setUpdatingTaskId(taskId);
      const assigneeId = newAssigneeId ? parseInt(newAssigneeId) : null;
      await taskAPI.updateTask(taskId, { assigned_to_id: assigneeId });
      fetchFilteredTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    try {
      setUpdatingTaskId(taskId);
      await taskAPI.updateTask(taskId, { priority: newPriority });
      fetchFilteredTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      setUpdatingTaskId(taskId);
      await taskAPI.deleteTask(taskId);
      fetchFilteredTasks();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
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

  const getPriorityBadgeStyle = (p) => {
    switch (p) {
      case 'Critical': return 'bg-slate-900 text-white border-slate-900 font-bold';
      case 'High': return 'bg-slate-800 text-white border-slate-800 font-bold';
      case 'Medium': return 'bg-slate-200 text-slate-900 border-slate-300 font-bold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
  };

  const getStatusBadgeStyle = (s) => {
    switch (s) {
      case 'Completed': return 'bg-slate-900 text-white border-slate-900 font-bold';
      case 'Closed': return 'bg-slate-800 text-white border-slate-800 font-bold';
      case 'In Progress': return 'bg-slate-200 text-slate-900 border-slate-300 font-bold';
      case 'Scheduled': return 'bg-slate-100 text-slate-800 border-slate-200 font-semibold';
      case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      case 'Triage': return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
  };

  const getHeaderIcon = () => {
    return <Sparkles className="h-5 w-5 text-slate-900" />;
  };

  const filteredTasks = searchQuery ? tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.assignee_name && t.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) : tasks;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[88vh] flex flex-col overflow-hidden border border-slate-200 my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {getHeaderIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full">
                  {filteredTasks.length} Tasks
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Interactive task manager – update status, assignee, priority & live timers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNavigateToPage}
              className="text-xs font-bold text-slate-900 hover:underline bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 shadow-2xs"
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
              placeholder="Filter tasks by title, ID, or assignee name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50/90 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium transition-all"
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
              <p className="text-xs text-slate-500">There are currently no tasks matching this criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200/90 rounded-2xl shadow-2xs">
              <table className="w-full text-left text-xs text-slate-800 border-collapse">
                <thead className="bg-slate-50/90 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4 min-w-[220px]">Task Title</th>
                    <th className="py-3 px-4 min-w-[160px]">Assigned To</th>
                    <th className="py-3 px-4 min-w-[120px]">Priority</th>
                    <th className="py-3 px-4 min-w-[140px]">Time Tracked</th>
                    <th className="py-3 px-4 min-w-[110px]">Due Date</th>
                    <th className="py-3 px-4 min-w-[140px]">Status</th>
                    <th className="py-3 px-4 text-right min-w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredTasks.map((t) => {
                    const isCompleted = t.status === 'Completed' || t.status === 'Closed';
                    const isUpdating = updatingTaskId === t.id;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/90 transition-colors group">
                        
                        {/* Task Title & Key */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300 shrink-0">
                              #{t.task_id}
                            </span>
                            <span 
                              onClick={() => setSelectedTaskId(t.id)}
                              className={`font-bold text-slate-900 group-hover:underline transition-colors cursor-pointer ${isCompleted ? 'line-through text-slate-400' : ''}`}
                            >
                              {t.title}
                            </span>
                          </div>
                        </td>

                        {/* Interactive Assignee Dropdown */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <select
                              value={t.assigned_to_id || ''}
                              disabled={isUpdating}
                              onChange={(e) => handleAssigneeChange(t.id, e.target.value)}
                              className="w-full appearance-none px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 cursor-pointer pr-7 transition-all"
                            >
                              <option value="">-- Unassigned --</option>
                              {usersList.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* Interactive Priority Dropdown */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <select
                              value={t.priority}
                              disabled={isUpdating}
                              onChange={(e) => handlePriorityChange(t.id, e.target.value)}
                              className={`appearance-none px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer pr-7 transition-all ${getPriorityBadgeStyle(t.priority)}`}
                            >
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* Live Time Tracker Badge */}
                        <td className="py-3 px-4">
                          <TaskTimerBadge task={t} onTimerUpdated={fetchFilteredTasks} />
                        </td>

                        {/* Due Date */}
                        <td className="py-3 px-4 text-slate-600 font-semibold whitespace-nowrap">
                          {t.due_date || 'N/A'}
                        </td>

                        {/* Interactive Status Dropdown */}
                        <td className="py-3 px-4">
                          <div className="relative">
                            <select
                              value={t.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(t.id, e.target.value)}
                              className={`appearance-none px-2.5 py-1 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer pr-7 transition-all ${getStatusBadgeStyle(t.status)}`}
                            >
                              <option value="Triage">Triage</option>
                              <option value="Pending">Pending</option>
                              <option value="Scheduled">Scheduled</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                              <option value="Closed">Closed</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedTaskId(t.id)}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-0.5 shadow-2xs"
                              title="View Task Details"
                            >
                              Details <ArrowUpRight className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(t.id)}
                              disabled={isUpdating}
                              className="p-1 text-slate-600 hover:text-black hover:bg-slate-200 rounded-lg transition-colors"
                              title="Delete Task"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Showing {filteredTasks.length} tasks</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all shadow-2xs"
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
