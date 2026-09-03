import React, { useState, useEffect } from 'react';
import { userAPI, teamAPI } from '../services/api';
import { Filter, RotateCcw, Check, Calendar, User as UserIcon, FolderKanban, Shield } from 'lucide-react';

export default function TaskFilterPanel({ filters, onApply, onReset }) {
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);

  const [assignedToId, setAssignedToId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [createdById, setCreatedById] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);

  const allStatuses = ['Triage', 'Pending', 'Scheduled', 'In Progress', 'Completed', 'Deleted'];
  const allPriorities = ['Low', 'Medium', 'High', 'Critical'];

  useEffect(() => {
    userAPI.getUsers().then(res => setUsers(res.data)).catch(console.error);
    teamAPI.getTeams().then(res => setTeams(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (filters) {
      setSelectedStatuses(filters.status ? filters.status.split(',') : []);
      setSelectedPriorities(filters.priority ? filters.priority.split(',') : []);
      setAssignedToId(filters.assigned_to_id || '');
      setTeamId(filters.team_id || '');
      setCreatedById(filters.created_by_id || '');
      setFromDate(filters.from_date || '');
      setToDate(filters.to_date || '');
    }
  }, [filters]);

  const toggleStatus = (st) => {
    if (selectedStatuses.includes(st)) {
      setSelectedStatuses(selectedStatuses.filter(s => s !== st));
    } else {
      setSelectedStatuses([...selectedStatuses, st]);
    }
  };

  const togglePriority = (pr) => {
    if (selectedPriorities.includes(pr)) {
      setSelectedPriorities(selectedPriorities.filter(p => p !== pr));
    } else {
      setSelectedPriorities([...selectedPriorities, pr]);
    }
  };

  const handleApply = () => {
    onApply({
      status: selectedStatuses.length > 0 ? selectedStatuses.join(',') : undefined,
      priority: selectedPriorities.length > 0 ? selectedPriorities.join(',') : undefined,
      assigned_to_id: assignedToId || undefined,
      team_id: teamId || undefined,
      created_by_id: createdById || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    });
  };

  const handleReset = () => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setAssignedToId('');
    setTeamId('');
    setCreatedById('');
    setFromDate('');
    setToDate('');
    onReset && onReset();
  };

  const getStatusChipStyle = (st, isSelected) => {
    if (!isSelected) {
      return 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
    }
    switch (st) {
      case 'Completed': return 'bg-emerald-600 text-white border-emerald-600 shadow-sm';
      case 'In Progress': return 'bg-blue-600 text-white border-blue-600 shadow-sm';
      case 'Scheduled': return 'bg-purple-600 text-white border-purple-600 shadow-sm';
      case 'Pending': return 'bg-amber-500 text-white border-amber-500 shadow-sm';
      case 'Triage': return 'bg-indigo-600 text-white border-indigo-600 shadow-sm';
      case 'Deleted': return 'bg-rose-600 text-white border-rose-600 shadow-sm';
      default: return 'bg-slate-700 text-white border-slate-700 shadow-sm';
    }
  };

  const getPriorityChipStyle = (pr, isSelected) => {
    if (!isSelected) {
      return 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50';
    }
    switch (pr) {
      case 'Critical': return 'bg-rose-600 text-white border-rose-600 shadow-sm';
      case 'High': return 'bg-orange-500 text-white border-orange-500 shadow-sm';
      case 'Medium': return 'bg-amber-500 text-white border-amber-500 shadow-sm';
      default: return 'bg-slate-600 text-white border-slate-600 shadow-sm';
    }
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedPriorities.length > 0 || assignedToId || teamId || createdById || fromDate || toDate;

  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-5 backdrop-blur-sm">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100/80 text-blue-700 rounded-lg">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Filter Tasks</h3>
            <p className="text-[11px] text-slate-500">Refine task view by status, priority, assignments, and dates</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="h-3 w-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Filter Sections Grid */}
      <div className="space-y-4 text-xs">
        
        {/* Status Chips */}
        <div>
          <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2">
            Status Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map(st => {
              const isSelected = selectedStatuses.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleStatus(st)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${getStatusChipStyle(st, isSelected)}`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority Chips */}
        <div>
          <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-2">
            Priority Filter
          </label>
          <div className="flex flex-wrap gap-2">
            {allPriorities.map(pr => {
              const isSelected = selectedPriorities.includes(pr);
              return (
                <button
                  key={pr}
                  type="button"
                  onClick={() => togglePriority(pr)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 ${getPriorityChipStyle(pr, isSelected)}`}
                >
                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  <span>{pr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Select Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          
          {/* Assigned To Select */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1.5">
              Assigned To
            </label>
            <div className="relative">
              <select
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 shadow-sm"
              >
                <option value="">All Assignees</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.user_id})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Select */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1.5">
              Team
            </label>
            <select
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 shadow-sm"
            >
              <option value="">All Teams</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Created By Select */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1.5">
              Created By
            </label>
            <select
              value={createdById}
              onChange={(e) => setCreatedById(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium text-slate-800 shadow-sm"
            >
              <option value="">All Creators</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Due Date Range */}
          <div>
            <label className="block font-bold uppercase tracking-wider text-slate-500 text-[10px] mb-1.5">
              Due Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                title="From Date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-1/2 px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                title="To Date"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Apply Actions */}
      <div className="flex justify-end items-center gap-3 pt-3 border-t border-slate-200/60">
        <button
          onClick={handleApply}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center gap-1.5"
        >
          <Check className="h-4 w-4 stroke-[2.5]" /> Apply Filters
        </button>
      </div>
    </div>
  );
}
