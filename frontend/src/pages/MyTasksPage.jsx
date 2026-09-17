import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI } from '../services/api';
import { CheckSquare } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskWorkspace from '../components/TaskWorkspace';

export default function MyTasksPage({ searchTerm }) {
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getTasks({ view_type: 'my_tasks' });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
    userAPI.getUsers().then(res => setUsersList(res.data)).catch(console.error);
  }, []);

  const filteredTasks = searchTerm
    ? tasks.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.task_id.toLowerCase().includes(searchTerm.toLowerCase()))
    : tasks;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-slate-900" /> My Tasks
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Tasks specifically assigned to your user account – Drag & drop cards to update status
          </p>
        </div>
      </div>

      {/* Drag & Drop Kanban Board / Table Workspace */}
      <TaskWorkspace
        tasks={filteredTasks}
        loading={loading}
        onTaskUpdated={fetchMyTasks}
        onSelectTask={(id) => setSelectedTaskId(id)}
        usersList={usersList}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchMyTasks()}
      />

    </div>
  );
}
