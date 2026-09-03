import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, commentAPI, attachmentAPI } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { 
  X, 
  MessageSquare, 
  Paperclip, 
  History, 
  Calendar, 
  User as UserIcon, 
  FolderKanban, 
  Tag, 
  Trash2, 
  RotateCcw, 
  Send, 
  Upload,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function TaskDetailModal({ taskId, isOpen, onClose, onTaskUpdated }) {
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dialogError, setDialogError] = useState({ isOpen: false, title: '', message: '' });

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await taskAPI.getTaskById(taskId);
      setTask(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  if (!isOpen) return null;

  const handleStatusChange = async (newStatus) => {
    if (!task) return;
    try {
      setStatusUpdating(true);
      const res = await taskAPI.updateTask(task.id, { status: newStatus });
      setTask(res.data);
      onTaskUpdated && onTaskUpdated(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;
    try {
      setPostingComment(true);
      await commentAPI.addComment(task.id, newComment);
      setNewComment('');
      fetchTaskDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleUploadFile = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !task) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      await attachmentAPI.uploadAttachment(task.id, formData);
      fetchTaskDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteTask = async () => {
    if (!task) return;
    try {
      await taskAPI.deleteTask(task.id);
      onTaskUpdated && onTaskUpdated();
      onClose();
    } catch (err) {
      setDialogError({
        isOpen: true,
        title: "Delete Failed",
        message: err.response?.data?.detail || "Failed to delete task"
      });
    }
  };

  const handleRestoreTask = async () => {
    if (!task) return;
    try {
      const res = await taskAPI.restoreTask(task.id);
      setTask(res.data);
      onTaskUpdated && onTaskUpdated(res.data);
    } catch (err) {
      setDialogError({
        isOpen: true,
        title: "Restore Failed",
        message: err.response?.data?.detail || "Failed to restore task"
      });
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Triage': return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'Deleted': return 'bg-rose-100 text-rose-800 border-rose-300 line-through';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95">
        
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading task details...</div>
        ) : !task ? (
          <div className="p-12 text-center text-slate-500 font-medium">Task not found</div>
        ) : (
          <div>
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 tracking-wider">#{task.task_id}</span>
                <h2 className="text-xl font-bold text-slate-800">{task.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                {task.status !== 'Deleted' && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Soft Delete Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {task.status === 'Deleted' && user?.role === 'Admin' && (
                  <button
                    onClick={handleRestoreTask}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Restore Task
                  </button>
                )}
                <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Status Bar */}
            <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={task.status}
                  disabled={task.status === 'Deleted' || statusUpdating}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusBadge(task.status)} focus:outline-none cursor-pointer`}
                >
                  <option value="Triage">Triage</option>
                  <option value="Pending">Pending</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Deleted" disabled>Deleted</option>
                </select>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${getPriorityBadge(task.priority)}`}>
                  {task.priority} Priority
                </span>
                <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                  {task.task_type}
                </span>
              </div>
            </div>

            {/* Content grid */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Created By</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <UserIcon className="h-3.5 w-3.5 text-slate-500" /> {task.creator_name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Assigned To</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <UserIcon className="h-3.5 w-3.5 text-blue-600" /> {task.assignee_name || 'Unassigned'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Team</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <FolderKanban className="h-3.5 w-3.5 text-indigo-500" /> {task.team_name || 'None'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Due Date</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-amber-500" /> {task.due_date || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</h3>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {task.description || 'No description provided.'}
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Paperclip className="h-3.5 w-3.5 text-slate-400" /> Attachments ({task.attachments.length})
                  </h3>
                  <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                    <Upload className="h-3.5 w-3.5" /> Upload File
                    <input type="file" onChange={handleUploadFile} className="hidden" />
                  </label>
                </div>

                {task.attachments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No file attachments</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {task.attachments.map(att => (
                      <a
                        key={att.id}
                        href={attachmentAPI.getDownloadUrl(task.id, att.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors flex items-center justify-between"
                      >
                        <span className="truncate">{att.file_name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">Download</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Audit Trail */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-slate-400" /> Activity Log
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                  {task.activity_logs.map(act => (
                    <div key={act.id} className="text-xs text-slate-600 flex items-center justify-between border-b border-slate-100 last:border-0 pb-1.5">
                      <div>
                        <span className="font-semibold text-slate-800">{act.user_name}</span>: {act.action}
                        {act.old_value && <span className="text-slate-400"> (from {act.old_value})</span>}
                        {act.new_value && <span className="font-medium text-slate-700"> → {act.new_value}</span>}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {new Date(act.created_at).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments Stream */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" /> Comments ({task.comments.length})
                </h3>

                <div className="space-y-3 mb-4">
                  {task.comments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No comments yet</p>
                  ) : (
                    task.comments.map(c => (
                      <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                          <span>{c.author_name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(c.created_at).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={postingComment || !newComment.trim()}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="h-3.5 w-3.5" /> Send
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* Delete Confirmation Custom Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Delete Task"
          message={`Are you sure you want to delete task #${task?.task_id} (${task?.title})? It will be soft-deleted and moved to Deleted Tasks.`}
          type="danger"
          confirmText="Delete Task"
          onConfirm={confirmDeleteTask}
          onClose={() => setShowDeleteConfirm(false)}
        />

        {/* Error Alert Custom Modal */}
        <ConfirmModal
          isOpen={dialogError.isOpen}
          title={dialogError.title}
          message={dialogError.message}
          type="danger"
          isAlert={true}
          confirmText="OK"
          onConfirm={() => setDialogError({ isOpen: false, title: '', message: '' })}
          onClose={() => setDialogError({ isOpen: false, title: '', message: '' })}
        />

      </div>
    </div>
  );
}
