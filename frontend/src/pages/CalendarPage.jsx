import React, { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';

export default function CalendarPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // We default to current month / September 2026 demo timeline
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 = September

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getTasks({ view_type: 'all_tasks' });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  // Helper to match task to calendar date
  const getTasksForDay = (dayNum) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateFormattedStr = `${currentYear}-${monthStr}-${dayStr}`;

    return tasks.filter(t => {
      if (!t.due_date && !t.start_date) return false;
      return t.due_date === dateFormattedStr || t.start_date === dateFormattedStr;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-amber-600" /> Calendar View
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Visual schedule of task due dates and scheduled activities
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-sm text-slate-800 min-w-[130px] text-center">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Day Headers */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-500 uppercase tracking-wider py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Matrix */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Loading Calendar...</div>
        ) : (
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 text-xs min-h-[500px]">
            {/* Empty slots before day 1 */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/40 p-2 min-h-[90px]"></div>
            ))}

            {/* Days of the Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayTasks = getTasksForDay(dayNum);

              return (
                <div key={dayNum} className="p-2 min-h-[90px] bg-white hover:bg-slate-50/50 transition-colors flex flex-col justify-between">
                  <div className="font-bold text-slate-700 mb-1">{dayNum}</div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayTasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTaskId(t.id)}
                        className={`p-1.5 rounded border text-[11px] font-semibold cursor-pointer hover:shadow-sm transition-all truncate ${getPriorityColor(t.priority)}`}
                        title={`${t.task_id}: ${t.title} (${t.status})`}
                      >
                        <span className="font-mono text-[10px] block opacity-80">{t.task_id}</span>
                        <span className="truncate block">{t.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchTasks()}
      />

    </div>
  );
}
