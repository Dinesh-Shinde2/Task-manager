import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, teamAPI, taskAPI, attachmentAPI } from '../services/api';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const { user } = useAuth();
  
  // Get today's YYYY-MM-DD string and current HH:MM time string
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentTimeStr = now.toTimeString().slice(0, 5);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'Development',
    priority: 'Medium',
    status: 'Pending',
    assign_to_type: 'Self',
    assigned_to_id: '',
    team_id: '',
    start_date: todayStr,
    due_date: todayStr,
    scheduled_at: currentTimeStr
  });
  
  const [teams, setTeams] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      const resetNow = new Date();
      const currentTodayStr = resetNow.toISOString().split('T')[0];
      const currentResetTimeStr = resetNow.toTimeString().slice(0, 5);
      
      // Reset form with default today's date and current time
      setFormData({
        title: '',
        description: '',
        task_type: 'Development',
        priority: 'Medium',
        status: 'Pending',
        assign_to_type: 'Self',
        assigned_to_id: user ? user.id : '',
        team_id: user ? user.team_id || '' : '',
        start_date: currentTodayStr,
        due_date: currentTodayStr,
        scheduled_at: currentResetTimeStr
      });
      setFile(null);

      // Load teams and users
      teamAPI.getTeams()
        .then(res => setTeams(res.data))
        .catch(console.error);

      userAPI.getUsers()
        .then(res => {
          if (user.role === 'Admin') {
            setAssignableUsers(res.data);
          } else {
            setAssignableUsers(res.data.filter(u => u.team_id === user.team_id));
          }
        })
        .catch(console.error);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        title: formData.title,
        description: formData.description,
        task_type: formData.task_type,
        priority: formData.priority,
        status: formData.status,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        scheduled_at: formData.scheduled_at || null
      };

      const res = await taskAPI.createTask(payload);
      const newTaskId = res.data.id;

      // Upload attachment if selected
      if (file) {
        const fileData = new FormData();
        fileData.append('file', file);
        await attachmentAPI.uploadAttachment(newTaskId, fileData);
      }

      onTaskCreated && onTaskCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 my-auto">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Create New Task</h2>
            <p className="text-xs text-slate-500">Add a new task to your personal or team workflow</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement user authentication module"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed instructions or issue summary..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Task Type, Priority, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Task Type
              </label>
              <select
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Development">Development</option>
                <option value="Bug Fix">Bug Fix</option>
                <option value="Feature">Feature</option>
                <option value="Documentation">Documentation</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Triage">Triage</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Assign Task To <span className="text-rose-500">*</span>
            </label>

            <div className="flex gap-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="assign_type"
                  checked={formData.assign_to_type === 'Self'}
                  onChange={() => setFormData({ 
                    ...formData, 
                    assign_to_type: 'Self', 
                    assigned_to_id: user ? user.id : '' 
                  })}
                  className="text-blue-600"
                />
                Assign to Myself ({user?.name})
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="assign_type"
                  checked={formData.assign_to_type === 'Member'}
                  onChange={() => setFormData({ ...formData, assign_to_type: 'Member', assigned_to_id: '' })}
                  className="text-blue-600"
                />
                Select Team Member
              </label>
            </div>

            {formData.assign_to_type === 'Member' && (
              <div>
                <select
                  required
                  value={formData.assigned_to_id}
                  onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose Member --</option>
                  {assignableUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role} - {u.user_id})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Team & Dates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Team
              </label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select Team --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                min={formData.start_date || todayStr}
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Scheduled Time & Attachment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Scheduled Time
              </label>
              <input
                type="time"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Attachment (Optional)
              </label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
}
