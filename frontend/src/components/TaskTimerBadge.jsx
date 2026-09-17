import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { taskAPI } from '../services/api';

export default function TaskTimerBadge({ task, onTimerUpdated, size = 'sm' }) {
  const [seconds, setSeconds] = useState(task?.time_spent_seconds || 0);
  const [isRunning, setIsRunning] = useState(Boolean(task?.is_timer_running));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSeconds(task?.time_spent_seconds || 0);
    setIsRunning(Boolean(task?.is_timer_running));
  }, [task?.time_spent_seconds, task?.is_timer_running]);

  // Live second ticker when timer is active
  useEffect(() => {
    let interval = null;
    if (isRunning && task?.status !== 'Completed' && task?.status !== 'Closed' && task?.status !== 'Deleted') {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, task?.status]);

  const formatDisplayTime = (totalSec) => {
    const s = Math.max(0, parseInt(totalSec) || 0);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
  };

  const handleToggleTimer = async (e) => {
    e.stopPropagation();
    if (loading || !task) return;
    try {
      setLoading(true);
      if (isRunning) {
        const res = await taskAPI.pauseTimer(task.id);
        setIsRunning(false);
        setSeconds(res.data.time_spent_seconds);
        onTimerUpdated && onTimerUpdated(res.data);
      } else {
        const res = await taskAPI.startTimer(task.id);
        setIsRunning(true);
        setSeconds(res.data.time_spent_seconds);
        onTimerUpdated && onTimerUpdated(res.data);
      }
    } catch (err) {
      console.error('Timer action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const isClosedOrDeleted = task?.status === 'Completed' || task?.status === 'Closed' || task?.status === 'Deleted';

  const formatTimestamp = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      let str = String(dateString).trim();

      if (str.includes('IST')) return str;

      if (str.includes('Start: ') || str.includes('End: ')) {
        return str.replace(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/g, (match) => {
          const isoStr = match.replace(' ', 'T') + 'Z';
          const d = new Date(isoStr);
          return isNaN(d.getTime()) ? match : d.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        });
      }

      if (str.includes('T') && !str.endsWith('Z') && !str.includes('+') && !str.includes('-')) {
        str += 'Z';
      } else if (!str.includes('T') && !str.includes('Z') && !str.includes('+')) {
        str = str.replace(' ', 'T') + 'Z';
      }

      const d = new Date(str);
      if (isNaN(d.getTime())) return dateString;

      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return dateString;
    }
  };

  if (size === 'lg') {
    const timerLogs = (task?.activity_logs || []).filter(a => 
      a.action.includes('Timer') || a.action.includes('Created')
    );

    const latestStartLog = [...timerLogs].reverse().find(a => a.action.includes('Started'));
    const latestPauseLog = [...timerLogs].reverse().find(a => a.action.includes('Paused'));

    const startTimeDisplay = isRunning 
      ? formatTimestamp(task?.timer_started_at || latestStartLog?.created_at)
      : (latestStartLog ? formatTimestamp(latestStartLog.created_at) : (task?.timer_started_at ? formatTimestamp(task.timer_started_at) : 'Not Started'));

    const pauseTimeDisplay = isRunning
      ? 'Ticking Live...'
      : (latestPauseLog ? formatTimestamp(latestPauseLog.created_at) : (seconds > 0 ? formatTimestamp(task?.updated_at) : 'N/A'));

    return (
      <div className="bg-slate-900 text-white p-4.5 rounded-2xl shadow-md border border-slate-800 space-y-4">
        
        {/* Top Banner Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isRunning ? 'bg-white/10 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Time Tracked</span>
                {isRunning ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" /> Ticking Live
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    Paused
                  </span>
                )}
              </div>
              <div className="text-2xl font-mono font-bold tracking-tight text-white mt-0.5">
                {formatDisplayTime(seconds)}
              </div>
            </div>
          </div>

          {!isClosedOrDeleted && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleTimer}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm bg-white hover:bg-slate-100 text-slate-900 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 fill-current" /> Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" /> Start Timer
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Timestamps Breakdown Grid (Start Time, End/Pause Time, Total Duration) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span> Start Time
            </span>
            <span className="font-mono font-bold text-slate-100 block truncate">
              {startTimeDisplay}
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> End / Pause Time
            </span>
            <span className="font-mono font-bold text-slate-100 block truncate">
              {pauseTimeDisplay}
            </span>
          </div>

          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Total Duration
            </span>
            <span className="font-mono font-bold text-white block">
              {formatDisplayTime(seconds)}
            </span>
          </div>
        </div>

        {/* Session Logs History */}
        {timerLogs.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Time Tracking Sessions ({timerLogs.length})
            </div>
            <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-2 max-h-36 overflow-y-auto space-y-1.5 scrollbar-thin">
              {timerLogs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{log.user_name || 'User'}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {log.action}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] flex-wrap">
                    {log.old_value && <span className="text-slate-300">{log.old_value}</span>}
                    {log.new_value && <span className="text-slate-200 font-semibold">{log.new_value}</span>}
                    <span className="text-slate-500">{formatTimestamp(log.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border transition-colors ${
        isRunning
          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
          : 'bg-slate-100 text-slate-800 border-slate-200'
      }`}
    >
      <Clock className={`h-3.5 w-3.5 ${isRunning ? 'text-white animate-spin' : 'text-slate-500'}`} />
      <span>{formatDisplayTime(seconds)}</span>

      {!isClosedOrDeleted && (
        <button
          onClick={handleToggleTimer}
          disabled={loading}
          className={`p-1 rounded hover:bg-white/20 transition-colors ml-0.5 ${
            isRunning ? 'text-white' : 'text-slate-700'
          }`}
          title={isRunning ? 'Pause Timer' : 'Start Timer'}
        >
          {isRunning ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current" />}
        </button>
      )}
    </div>
  );
}
