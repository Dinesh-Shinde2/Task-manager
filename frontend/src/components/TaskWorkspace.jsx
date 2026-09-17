import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  Clock, 
  Calendar, 
  User as UserIcon, 
  Users,
  ArrowUpRight, 
  SearchX, 
  MoveRight, 
  CheckCircle2, 
  Flame, 
  Layers,
  ChevronDown,
  Trash2
} from 'lucide-react';
import TaskTimerBadge from './TaskTimerBadge';
import { taskAPI } from '../services/api';

export default function TaskWorkspace({ tasks, loading, onTaskUpdated, onSelectTask, usersList = [] }) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropTargetStatus, setDropTargetStatus] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const statuses = ['Triage', 'Pending', 'Scheduled', 'In Progress', 'Completed'];

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dropTargetStatus !== status) {
      setDropTargetStatus(status);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDropTargetStatus(null);
    const taskIdStr = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskIdStr) return;

    const taskId = parseInt(taskIdStr);
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask || targetTask.status === newStatus) return;

    try {
      setUpdatingTaskId(taskId);
      await taskAPI.updateTask(taskId, { status: newStatus });
      onTaskUpdated && onTaskUpdated();
    } catch (err) {
      console.error('Failed to update task status via drag and drop:', err);
    } finally {
      setUpdatingTaskId(null);
      setDraggedTaskId(null);
    }
  };

  const handleStatusSelectChange = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      await taskAPI.updateTask(taskId, { status: newStatus });
      onTaskUpdated && onTaskUpdated();
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
      onTaskUpdated && onTaskUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingTaskId(null);
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
      case 'In Progress': return 'bg-slate-200 text-slate-900 border-slate-300 font-bold';
      case 'Scheduled': return 'bg-slate-100 text-slate-800 border-slate-200 font-semibold';
      case 'Pending': return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      case 'Triage': return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
    }
  };

  const getColumnHeaderColor = (s) => {
    return 'border-t-2 border-slate-900 text-slate-900 bg-slate-100/80';
  };

  return (
    <div className="space-y-4">
      
      {/* View Switcher Header Bar */}
      <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Display Mode:</span>
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban Board (Drag & Drop)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Table List
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-semibold px-2">
          {tasks.length} Active Items
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400 font-medium text-xs">
          Loading task workspace...
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-2 max-w-sm mx-auto">
          <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <SearchX className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-700 text-sm">No tasks found</h3>
          <p className="text-xs text-slate-500">There are currently no tasks matching your filters.</p>
        </div>
      ) : viewMode === 'kanban' ? (
        /* ================= KANBAN BOARD WITH DRAG & DROP ================= */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {statuses.map((columnStatus) => {
            const columnTasks = tasks.filter(t => t.status === columnStatus);
            const isDropTarget = dropTargetStatus === columnStatus;

            return (
              <div
                key={columnStatus}
                onDragOver={(e) => handleDragOver(e, columnStatus)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, columnStatus)}
                className={`bg-slate-100/70 rounded-2xl border border-t-4 ${getColumnHeaderColor(columnStatus)} flex flex-col min-h-[500px] transition-all ${
                  isDropTarget ? 'ring-2 ring-blue-500 bg-blue-50/40 scale-[1.01]' : 'border-slate-200/90'
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 flex items-center justify-between border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">{columnStatus}</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-2xs">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards Drop Area */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[70vh]">
                  {columnTasks.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200/80 rounded-xl p-6 text-center text-slate-400 text-[11px] font-medium">
                      Drag tasks here
                    </div>
                  ) : (
                    columnTasks.map((t) => (
                      <div
                        key={t.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, t.id)}
                        onClick={() => onSelectTask(t.id)}
                        className={`bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-blue-300 space-y-3 group ${
                          draggedTaskId === t.id ? 'opacity-40 border-dashed border-blue-400' : ''
                        }`}
                      >
                        {/* Card Top Row: Task Key, Team & Priority */}
                        <div className="flex items-center justify-between gap-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              #{t.task_id}
                            </span>
                            {t.team_name && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1">
                                <Users className="w-2.5 h-2.5 text-slate-500" />
                                {t.team_name}
                              </span>
                            )}
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${getPriorityBadgeStyle(t.priority)}`}>
                            {t.priority}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 className="font-bold text-xs text-slate-900 group-hover:underline transition-colors line-clamp-2 leading-snug">
                          {t.title}
                        </h4>

                        {/* Timer Badge */}
                        <div onClick={(e) => e.stopPropagation()}>
                          <TaskTimerBadge task={t} onTimerUpdated={onTaskUpdated} />
                        </div>

                        {/* Card Footer: Assignee & Due Date */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-700 flex items-center gap-1">
                            <UserIcon className="h-3 w-3 text-slate-400" /> {t.assignee_name || 'Unassigned'}
                          </span>
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="h-3 w-3 text-slate-400" /> {t.due_date || 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= TABLE LIST VIEW ================= */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 border-collapse">
              <thead className="bg-slate-50/90 border-b border-slate-200 font-bold uppercase text-[11px] text-slate-500 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 min-w-[200px]">Task Title</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Team</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Assigned To</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Priority</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Time Tracked</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Due Date</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Status</th>
                  <th className="py-3.5 px-4 text-right min-w-[90px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {tasks.map((t) => {
                  const isCompleted = t.status === 'Completed' || t.status === 'Closed';
                  const isUpdating = updatingTaskId === t.id;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/90 transition-colors group">
                      
                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-900 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                            #{t.task_id}
                          </span>
                          <span 
                            onClick={() => onSelectTask(t.id)}
                            className={`font-bold text-slate-900 group-hover:underline transition-colors cursor-pointer ${isCompleted ? 'line-through text-slate-400' : ''}`}
                          >
                            {t.title}
                          </span>
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 inline-flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-500" />
                          {t.team_name || 'No Team'}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4">
                        {usersList.length > 0 ? (
                          <div className="relative">
                            <select
                              value={t.assigned_to_id || ''}
                              disabled={isUpdating}
                              onChange={(e) => handleAssigneeChange(t.id, e.target.value)}
                              className="w-full appearance-none px-2.5 py-1 text-xs font-semibold bg-slate-50 hover:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 cursor-pointer pr-7 transition-all"
                            >
                              <option value="">-- Unassigned --</option>
                              {usersList.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                          </div>
                        ) : (
                          <span className="font-semibold text-slate-700">{t.assignee_name || 'Unassigned'}</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${getPriorityBadgeStyle(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>

                      {/* Timer */}
                      <td className="py-3 px-4">
                        <TaskTimerBadge task={t} onTimerUpdated={onTaskUpdated} />
                      </td>

                      {/* Due Date */}
                      <td className="py-3 px-4 text-slate-600 font-semibold whitespace-nowrap">
                        {t.due_date || 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="relative">
                          <select
                            value={t.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusSelectChange(t.id, e.target.value)}
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

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onSelectTask(t.id)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-black text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-0.5 shadow-2xs"
                        >
                          Details <ArrowUpRight className="h-3 w-3" />
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
