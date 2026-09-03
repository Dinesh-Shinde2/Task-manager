import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, teamAPI, taskAPI, attachmentAPI } from '../services/api';
import { X, Upload, Check, AlertCircle } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    task_type: 'Development',
    priority: 'Medium',
    status: 'Pending',
    assign_to_type: 'Self',
    assigned_to_id: '',
    team_id: '',
    start_date: '',
    due_date: '',
    scheduled_at: ''
  });
  
  const [teams, setTeams] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      // Reset form
      setFormData({
        title: '',
        description: '',
        task_type: 'Development',
        priority: 'Medium',
        status: 'Pending',
        assign_to_type: 'Self',
        assigned_to_id: user ? user.id : '',
        team_id: user ? user.team_id || '' : '',
        start_date: '',
        due_date: '',
        scheduled_at: ''
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
            // Filter users in member's team
            setAssignableUsers(res.data.filter(u => u.team_id === user.team_id));
          }
        })
        .catch(console.error);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task Title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        task_type: formData.task_type,
        priority: formData.priority,
        status: formData.status,
        assign_to_type: formData.assign_to_type,
        assigned_to_id: formData.assign_to_type === 'Self' ? user.id : (formData.assigned_to_id ? parseInt(formData.assigned_to_id) : null),
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
        start_date: formData.start_date || null,
        due_date: formData.due_date || null,
        scheduled_at: formData.scheduled_at || null
      };

      const res = await taskAPI.createTask(payload);
      const createdTask = res.data;

      // Handle attachment upload if present
      if (file && createdTask.id) {
        const fileData = new FormData();
        fileData.append('file', file);
        await attachmentAPI.uploadAttachment(createdTask.id, fileData);
      }

      onTaskCreated && onTaskCreated(createdTask);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Create New Task</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fix Login Authentication Issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Detailed instructions or issue summary..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Task Type & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Task Type
              </label>
              <select
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bug">Bug</option>
                <option value="Development">Development</option>
                <option value="Testing">Testing</option>
                <option value="Support">Support</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
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
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Triage">Triage</option>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
          </div>

          {/* Assign To Logic */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Assign To *
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="assign_to_type"
                  value="Self"
                  checked={formData.assign_to_type === 'Self'}
                  onChange={() => setFormData({ ...formData, assign_to_type: 'Self', assigned_to_id: user.id })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                Self ({user?.name})
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="assign_to_type"
                  value="Other"
                  checked={formData.assign_to_type === 'Other'}
                  onChange={() => setFormData({ ...formData, assign_to_type: 'Other' })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                Select Team Member
              </label>
            </div>

            {formData.assign_to_type === 'Other' && (
              <div className="pt-2">
                <select
                  required
                  value={formData.assigned_to_id}
                  onChange={(e) => setFormData({ ...formData, assigned_to_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Member --</option>
                  {assignableUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.user_id}) - {u.team_name || 'No Team'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Team Select & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Team
              </label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Attachment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="task-file-input"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="task-file-input"
                  className="w-full border border-dashed border-slate-300 hover:border-blue-500 px-3 py-1.5 rounded-lg text-xs text-slate-600 cursor-pointer flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors truncate"
                >
                  <Upload className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="truncate">{file ? file.name : 'Choose File...'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
