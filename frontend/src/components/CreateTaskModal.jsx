import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, teamAPI, taskAPI, attachmentAPI } from '../services/api';
import { X, Upload, Check, AlertCircle, Clock, ChevronDown, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }) {
  const { user } = useAuth();
  
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
  
  const displayTeams = user?.role === 'Admin'
    ? teams
    : teams.filter(t => t.id === user?.team_id || t.name === user?.team_name || (Array.isArray(t.members) && t.members.some(m => m.id === user?.id || m.user_id === user?.user_id)));
  
  // Time tracking popup confirmation state
  const [showTimeTrackerPrompt, setShowTimeTrackerPrompt] = useState(false);

  const getUserTeamId = (targetUser, allTeams) => {
    if (!targetUser) return '';
    if (targetUser.team_id) return String(targetUser.team_id);
    if (targetUser.team_name && Array.isArray(allTeams)) {
      const match = allTeams.find(t => t.name === targetUser.team_name);
      if (match) return String(match.id);
    }
    if (Array.isArray(allTeams)) {
      const match = allTeams.find(t => Array.isArray(t.members) && t.members.some(m => String(m.id) === String(targetUser.id) || String(m.user_id) === String(targetUser.user_id)));
      if (match) return String(match.id);
    }
    return '';
  };

  useEffect(() => {
    if (isOpen) {
      setError('');
      setShowTimeTrackerPrompt(false);
      const resetNow = new Date();
      const currentTodayStr = resetNow.toISOString().split('T')[0];
      const currentResetTimeStr = resetNow.toTimeString().slice(0, 5);
      
      setFormData({
        title: '',
        description: '',
        task_type: 'Development',
        priority: 'Medium',
        status: 'Pending',
        assign_to_type: 'Self',
        assigned_to_id: user ? user.id : '',
        team_id: '',
        start_date: currentTodayStr,
        due_date: currentTodayStr,
        scheduled_at: currentResetTimeStr
      });
      setFile(null);

      Promise.all([
        teamAPI.getTeams(),
        userAPI.getUsers()
      ]).then(([teamsRes, usersRes]) => {
        const loadedTeams = Array.isArray(teamsRes?.data) ? teamsRes.data : [];
        const loadedUsers = Array.isArray(usersRes?.data) ? usersRes.data : [];
        setTeams(loadedTeams);

        const filteredUsers = user?.role === 'Admin'
          ? loadedUsers
          : loadedUsers.filter(u => u.team_id === user?.team_id || u.team_name === user?.team_name);

        setAssignableUsers(filteredUsers);

        // Auto default team to current user's team
        const defaultTeamId = getUserTeamId(user, loadedTeams);
        setFormData(prev => ({
          ...prev,
          team_id: defaultTeamId || (loadedTeams.length > 0 ? String(loadedTeams[0].id) : '')
        }));
      }).catch(console.error);
    }
  }, [isOpen, user]);

  const handleAssignSelf = () => {
    const myTeamId = getUserTeamId(user, teams);
    setFormData(prev => ({
      ...prev,
      assign_to_type: 'Self',
      assigned_to_id: user ? user.id : '',
      team_id: myTeamId || prev.team_id
    }));
  };

  const handleSelectMemberRadio = () => {
    setFormData(prev => ({
      ...prev,
      assign_to_type: 'Member',
      assigned_to_id: ''
    }));
  };

  const handleMemberSelect = (memberIdStr) => {
    const selectedUser = assignableUsers.find(u => String(u.id) === String(memberIdStr));
    const memberTeamId = getUserTeamId(selectedUser, teams);

    setFormData(prev => ({
      ...prev,
      assigned_to_id: memberIdStr,
      team_id: memberTeamId || prev.team_id
    }));
  };

  const handleFormSubmitClick = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    setError('');
    // Trigger the Time Tracker Confirmation Popup
    setShowTimeTrackerPrompt(true);
  };

  const executeCreateTask = async (enableTimeTracking) => {
    setShowTimeTrackerPrompt(false);
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
        scheduled_at: formData.scheduled_at || null,
        enable_time_tracking: enableTimeTracking
      };

      const res = await taskAPI.createTask(payload);
      const newTaskId = res.data.id;

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/90 my-auto animate-in fade-in zoom-in-95">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create New Task</h2>
              <p className="text-xs text-slate-500 font-medium">Add a new task to your personal or team workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmitClick} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Task Title <span className="text-slate-900">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement user authentication module"
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 font-medium shadow-2xs placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed instructions or issue summary..."
              className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 font-medium shadow-2xs placeholder:text-slate-400"
            />
          </div>

          {/* Grid 1: Task Type, Priority, Initial Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Task Type
              </label>
              <div className="relative">
                <select
                  value={formData.task_type}
                  onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 font-semibold cursor-pointer shadow-2xs transition-all pr-9"
                >
                  <option value="Development">Development</option>
                  <option value="Bug Fix">Bug Fix</option>
                  <option value="Feature">Feature</option>
                  <option value="Documentation">Documentation</option>
                  <option value="Operations">Operations</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Priority
              </label>
              <div className="relative">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 font-semibold cursor-pointer shadow-2xs transition-all pr-9"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Initial Status
              </label>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full appearance-none px-3.5 py-2.5 text-sm bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800 font-semibold cursor-pointer shadow-2xs transition-all pr-9"
                >
                  <option value="Pending">Pending</option>
                  <option value="Triage">Triage</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Assignment & Team Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Assign Task To <span className="text-slate-900">*</span>
            </label>

            <div className="flex flex-wrap gap-5 text-xs font-bold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-400">
                <input
                  type="radio"
                  name="assign_type"
                  checked={formData.assign_to_type === 'Self'}
                  onChange={handleAssignSelf}
                  className="text-slate-900 accent-slate-900 h-4 w-4"
                />
                Assign to Myself ({user?.name || 'Current User'})
              </label>

              <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:border-slate-400">
                <input
                  type="radio"
                  name="assign_type"
                  checked={formData.assign_to_type === 'Member'}
                  onChange={handleSelectMemberRadio}
                  className="text-slate-900 accent-slate-900 h-4 w-4"
                />
                Select Team Member
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {formData.assign_to_type === 'Member' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Select Member</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.assigned_to_id}
                      onChange={(e) => handleMemberSelect(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-semibold cursor-pointer pr-8"
                    >
                      <option value="">-- Choose Member --</option>
                      {assignableUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.role} - {u.user_id})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Assigned Team</label>
                <div className="relative">
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-semibold cursor-pointer pr-8"
                  >
                    <option value="">-- Select Team --</option>
                    {displayTeams.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Mandatory Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                min={formData.start_date || todayStr}
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Scheduled Time <span className="text-slate-900">*</span>
              </label>
              <input
                type="time"
                required
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 hover:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-slate-800"
              />
            </div>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Attachment (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-900 hover:file:bg-slate-200"
            />
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
              className="px-6 py-2.5 text-xs font-bold bg-slate-900 hover:bg-black text-white rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>

        </form>

      </div>

      {/* Time Tracking Preference Popup Dialog */}
      {showTimeTrackerPrompt && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl mx-auto flex items-center justify-center shadow-xs">
              <Clock className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Calculate Time for this Task?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Do you want to enable automatic live time-tracking to calculate active progress seconds for this task?
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => executeCreateTask(true)}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" /> Yes, Track Time
              </button>
              <button
                type="button"
                onClick={() => executeCreateTask(false)}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="h-4 w-4 text-slate-500" /> No, Skip Tracking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>,
    document.body
  );
}
