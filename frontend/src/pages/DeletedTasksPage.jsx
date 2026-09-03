import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { Trash2, RotateCcw } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';
import ConfirmModal from '../components/ConfirmModal';

export default function DeletedTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dialogError, setDialogError] = useState({ isOpen: false, title: '', message: '' });

  const fetchDeletedTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getTasks({ view_type: 'deleted' });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedTasks();
  }, []);

  const handleRestore = async (taskIdDb) => {
    try {
      await taskAPI.restoreTask(taskIdDb);
      fetchDeletedTasks();
    } catch (err) {
      setDialogError({
        isOpen: true,
        title: "Restore Failed",
        message: err.response?.data?.detail || "Failed to restore task"
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Trash2 className="h-6 w-6 text-rose-600" /> Deleted Tasks (Soft Delete Audit)
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Archived tasks preserved in database with deletion logs & restoration functionality
        </p>
      </div>

      {/* Table matching Section 12 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading Deleted Tasks...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-5">Task ID</th>
                  <th className="py-3 px-5">Task</th>
                  <th className="py-3 px-5">Deleted By</th>
                  <th className="py-3 px-5">Deleted At</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">
                      No soft-deleted tasks found.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-rose-600">
                        #{t.task_id}
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800 line-through">
                        {t.title}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                        {t.deleted_by_name || 'System'}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                        {t.deleted_at ? new Date(t.deleted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                      </td>
                      <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTaskId(t.id)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                        >
                          View Log
                        </button>
                        <button
                          onClick={() => handleRestore(t.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="h-3 w-3" /> Restore Task
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
        onTaskUpdated={() => fetchDeletedTasks()}
      />

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
  );
}
