import React, { useState, useEffect } from 'react';
import { taskAPI, userAPI } from '../services/api';
import { ListTodo, Filter as FilterIcon, RotateCcw } from 'lucide-react';
import TaskFilterPanel from '../components/TaskFilterPanel';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskWorkspace from '../components/TaskWorkspace';

export default function AllTasksPage({ searchTerm }) {
  const [tasks, setTasks] = useState([]);
  const [usersList, setUsersList] = useState([]);
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
    userAPI.getUsers().then(res => setUsersList(res.data)).catch(console.error);
  }, [filters, searchTerm]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-slate-900" /> All Tasks (Admin Directory)
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Complete task directory across all teams – Drag & drop cards to manage status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-2xs ${
              showFilterPanel 
                ? 'bg-slate-900 border-slate-900 text-white' 
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

      {/* Drag & Drop Kanban Board / Table Workspace */}
      <TaskWorkspace
        tasks={tasks}
        loading={loading}
        onTaskUpdated={() => fetchAllTasks()}
        onSelectTask={(id) => setSelectedTaskId(id)}
        usersList={usersList}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchAllTasks()}
      />

    </div>
  );
}
