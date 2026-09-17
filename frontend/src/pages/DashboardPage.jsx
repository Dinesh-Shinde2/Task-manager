import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reportAPI, userAPI, taskAPI, teamAPI } from '../services/api';
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  ChevronRight, 
  Flame, 
  Share2, 
  TrendingUp, 
  Users, 
  ArrowUpRight,
  Search,
  MessageSquare,
  AlertTriangle,
  Zap,
  Minus,
  ArrowRight,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskTimerBadge from '../components/TaskTimerBadge';
import KpiTasksModal from '../components/KpiTasksModal';

export default function DashboardPage({ searchTerm, setSearchTerm }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [allTasksList, setAllTasksList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [teamFilter, setTeamFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'personal', 'team'
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [tableFilterSearch, setTableFilterSearch] = useState('');

  // Date Range Filter States
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activePreset, setActivePreset] = useState('Last 7 Days');
  
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const formatDateForInput = (d) => d.toISOString().split('T')[0];

  const [startDateInput, setStartDateInput] = useState(formatDateForInput(sevenDaysAgo));
  const [endDateInput, setEndDateInput] = useState(formatDateForInput(today));
  
  // Applied Date Range (used for filtering)
  const [appliedDateRange, setAppliedDateRange] = useState({
    label: 'All Time',
    startDate: '',
    endDate: ''
  });

  // State for KPI drill-down modal
  const [kpiModal, setKpiModal] = useState({
    isOpen: false,
    title: '',
    statusFilter: null,
    viewType: 'all_tasks'
  });

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const dashRes = await reportAPI.getDashboardData();
      setDashboardData(dashRes.data);

      try {
        const viewType = user?.role === 'Admin' ? 'all_tasks' : 'team_tasks';
        const allRes = await taskAPI.getTasks({ view_type: viewType });
        setAllTasksList(Array.isArray(allRes?.data) ? allRes.data : []);
      } catch (e) {
        console.error(e);
        setAllTasksList([]);
      }

      if (user?.role === 'Admin') {
        try {
          const metricsRes = await reportAPI.getAdminMetrics();
          setAdminMetrics(metricsRes.data);
        } catch (e) {
          console.error(e);
        }
      }

      try {
        const teamsRes = await teamAPI.getTeams();
        setTeamsList(Array.isArray(teamsRes?.data) ? teamsRes.data : []);
      } catch (e) {
        console.error(e);
      }

      try {
        const membersRes = await userAPI.getUsers();
        setTeamMembers(Array.isArray(membersRes?.data) ? membersRes.data : []);
      } catch (e) {
        console.error(e);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboard();
    }
  }, [user]);

  // Handle Preset Button Clicks in Date Range Picker
  const handlePresetSelect = (presetName) => {
    setActivePreset(presetName);
    const now = new Date();
    let start = new Date();

    if (presetName === 'All Time') {
      setStartDateInput('');
      setEndDateInput('');
    } else if (presetName === 'Last 7 Days') {
      start.setDate(now.getDate() - 7);
    } else if (presetName === 'Last 14 Days') {
      start.setDate(now.getDate() - 14);
    } else if (presetName === 'Last 30 Days') {
      start.setDate(now.getDate() - 30);
    } else if (presetName === 'This Month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (presetName !== 'Custom Range' && presetName !== 'All Time') {
      setStartDateInput(formatDateForInput(start));
      setEndDateInput(formatDateForInput(now));
    }
  };

  // Handle Apply Date Range
  const handleApplyDateRange = () => {
    let label = activePreset;
    if (activePreset === 'Custom Range' || !['All Time', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'This Month'].includes(activePreset)) {
      label = `${startDateInput} to ${endDateInput}`;
    }
    
    setAppliedDateRange({
      label: label,
      startDate: startDateInput,
      endDate: endDateInput
    });
    setIsDatePickerOpen(false);
  };

  const openKpiModal = (title, status, viewType = 'all_tasks') => {
    setKpiModal({
      isOpen: true,
      title,
      statusFilter: status,
      viewType
    });
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Urgent':
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 text-white text-[11px] font-bold">
            <Zap className="w-3 h-3 text-white" /> {p}
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 text-slate-900 border border-slate-300 text-[11px] font-bold">
            <TrendingUp className="w-3 h-3 text-slate-800" /> High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold">
            <Minus className="w-3 h-3 text-slate-600" /> Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium">
            Normal
          </span>
        );
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Completed':
      case 'Finished':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Finished
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-900 border border-slate-300 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> In Progress
          </span>
        );
      case 'In Review':
      case 'Triage':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> In Review
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3 bg-slate-50 min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Loading Workspace Dashboard...</p>
      </div>
    );
  }

  const my = dashboardData?.my_tasks_summary || {};
  const team = dashboardData?.team_tasks_summary || {};
  const recentTasks = dashboardData?.recent_tasks || [];

  // Personal Workload Dynamic Percentage Calculations
  const myTotal = my.total || 0;
  const myPending = (my.pending || 0) + (my.triage || 0);
  const myInProg = my.in_progress || 0;
  const myCompleted = my.completed || 0;

  const myInProgVelocityPct = myTotal > 0 ? Math.round((myInProg / myTotal) * 100) : 0;
  const myCompletedPct = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;

  // Filter tasks based on applied date range
  const baseTasks = allTasksList.length > 0 ? allTasksList : recentTasks;

  const dateFilteredTasks = baseTasks.filter(t => {
    if (!appliedDateRange.startDate || !appliedDateRange.endDate || appliedDateRange.label === 'All Time') return true;
    const createdStr = t.created_at ? t.created_at.split('T')[0] : null;
    const dueStr = t.due_date || null;
    const createdInRange = createdStr && createdStr >= appliedDateRange.startDate && createdStr <= appliedDateRange.endDate;
    const dueInRange = dueStr && dueStr >= appliedDateRange.startDate && dueStr <= appliedDateRange.endDate;
    return createdInRange || dueInRange;
  });

  const tasksToDisplay = dateFilteredTasks;

  // Dynamic Team-Scoped Tasks based on selected teamFilter
  const teamScopedTasks = (tasksToDisplay || []).filter(t => {
    if (!t) return false;
    if (teamFilter === 'All') return true;
    return t.team_name === teamFilter;
  });

  const teamTotal = teamScopedTasks.length;
  const teamCompleted = teamScopedTasks.filter(t => t.status === 'Completed' || t.status === 'Finished').length;
  const teamInProg = teamScopedTasks.filter(t => t.status === 'In Progress').length;
  const teamTriage = teamScopedTasks.filter(t => t.status === 'Triage' || t.status === 'Scheduled' || t.status === 'In Review').length;
  const teamPending = teamScopedTasks.filter(t => t.status === 'Pending').length;

  const teamDonePct = teamTotal > 0 ? ((teamCompleted / teamTotal) * 100).toFixed(1) : 0;
  const teamInProgPct = teamTotal > 0 ? ((teamInProg / teamTotal) * 100).toFixed(1) : 0;
  const teamTriagePct = teamTotal > 0 ? ((teamTriage / teamTotal) * 100).toFixed(1) : 0;
  const teamPendingPct = teamTotal > 0 ? ((teamPending / teamTotal) * 100).toFixed(1) : 0;
  const teamCompletionRate = teamTotal > 0 ? Math.round((teamCompleted / teamTotal) * 100) : 0;

  // Dynamic user workload calculated strictly for selected teamFilter
  const displayUserWorkload = (() => {
    // 1. Determine relevant team members for current teamFilter
    let targetMembers = [];

    if (teamFilter !== 'All') {
      const selectedTeam = (teamsList || []).find(tm => tm.name === teamFilter);
      if (selectedTeam && Array.isArray(selectedTeam.members) && selectedTeam.members.length > 0) {
        targetMembers = selectedTeam.members;
      } else {
        targetMembers = (teamMembers || []).filter(m => m.team_name === teamFilter || (selectedTeam && m.team_id === selectedTeam.id));
      }
    } else {
      if (Array.isArray(teamMembers) && teamMembers.length > 0) {
        targetMembers = teamMembers;
      } else {
        const allM = [];
        (teamsList || []).forEach(tm => {
          if (Array.isArray(tm.members)) {
            allM.push(...tm.members);
          }
        });
        targetMembers = allM;
      }
    }

    // 2. Build unique user map from targetMembers (deduplicated by user ID)
    const userMap = {};
    targetMembers.forEach(m => {
      const uniqueKey = m.id || m.user_id || m.name;
      if (uniqueKey && !userMap[uniqueKey]) {
        userMap[uniqueKey] = {
          id: m.id,
          user_id: m.user_id,
          user_name: m.name,
          team_name: m.team_name || teamFilter,
          team_id: m.team_id,
          assigned: 0
        };
      }
    });

    // 3. Count assigned tasks from teamScopedTasks
    (teamScopedTasks || []).forEach(t => {
      if (!t || t.status === 'Deleted') return;
      const assignedToId = t.assigned_to_id;
      const assigneeName = t.assignee_name;

      const userObj = Object.values(userMap).find(u =>
        (assignedToId && (u.id === assignedToId || u.user_id === assignedToId)) ||
        (assigneeName && assigneeName !== 'Unassigned' && u.user_name === assigneeName)
      );

      if (userObj) {
        userObj.assigned += 1;
      }
    });

    // 4. Return sorted user workload list
    return Object.values(userMap).sort((a, b) => b.assigned - a.assigned);
  })();

  const filteredDirectoryTasks = (tasksToDisplay || []).filter(t => {
    if (!t) return false;
    const query = (tableFilterSearch || searchTerm || '').toLowerCase().trim();
    const title = (t.title || '').toLowerCase();
    const taskId = (t.task_id || '').toLowerCase();
    const assignee = (t.assignee_name || '').toLowerCase();

    const matchesSearch = !query || 
      title.includes(query) ||
      taskId.includes(query) ||
      assignee.includes(query);

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesTeam = teamFilter === 'All' || t.team_name === teamFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesTeam;
  });

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative bg-slate-50">
      
      {/* Top Ambient Glow Backdrop */}
      <div className="relative w-full">
        <div className="absolute -top-12 left-1/4 w-96 h-40 bg-slate-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute -top-12 right-1/3 w-80 h-32 bg-slate-200/30 rounded-full blur-3xl pointer-events-none -z-10"></div>
        
        {/* Executive Welcome & Controls Header */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pt-1 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-200/80 text-slate-800 text-[11px] uppercase tracking-wider font-bold">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
                {user?.role || 'User'} Executive View
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                {dateStr}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Welcome back, {user?.name || 'Dinesh'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl font-medium">
              Real-time enterprise analytics, personal workload allocation, and cross-functional team operations.
            </p>
          </div>

          {/* Segmented Controls & Primary Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Segmented Tab Switcher */}
            <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>All Overview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'personal'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Personal Tasks</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${activeTab === 'personal' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {myPending + myInProg}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Analytics</span>
              </button>
            </div>

            {/* Secondary Controls: Working Date Range Picker */}
            <div className="flex items-center gap-2 relative">
              
              {/* Working Date Range Button with Calendar */}
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="h-8 px-3 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-300 shadow-2xs cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-slate-900" />
                <span>{appliedDateRange.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Interactive Calendar Date Range Picker Popover */}
              {isDatePickerOpen && (
                <div className="absolute right-0 top-10 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-900" />
                      <span className="text-xs font-bold text-slate-900">Select Date Range</span>
                    </div>
                    <button 
                      onClick={() => setIsDatePickerOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-4">
                    {['All Time', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'This Month'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all cursor-pointer ${
                          activePreset === preset
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  {/* Date Input Fields */}
                  <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Custom Date Range</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={startDateInput}
                          onChange={(e) => {
                            setStartDateInput(e.target.value);
                            setActivePreset('Custom Range');
                          }}
                          className="w-full h-8 px-2 bg-white text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">End Date</label>
                        <input
                          type="date"
                          value={endDateInput}
                          onChange={(e) => {
                            setEndDateInput(e.target.value);
                            setActivePreset('Custom Range');
                          }}
                          className="w-full h-8 px-2 bg-white text-xs text-slate-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer with APPLY Button */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        handlePresetSelect('Last 7 Days');
                        setIsDatePickerOpen(false);
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Reset
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                      >
                        Cancel
                      </button>

                      {/* Working APPLY Button */}
                      <button
                        type="button"
                        onClick={handleApplyDateRange}
                        className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="h-8 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-2xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Horizontal Team Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-slate-200/80">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
          <Users className="w-3.5 h-3.5 text-slate-700" /> Filter Team:
        </span>
        <button
          type="button"
          onClick={() => setTeamFilter('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            teamFilter === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Teams ({tasksToDisplay.length} tasks)
        </button>
        {teamsList.map((tm) => {
          const teamTaskCount = tasksToDisplay.filter(t => t.team_name === tm.name).length;
          return (
            <button
              key={tm.id}
              type="button"
              onClick={() => setTeamFilter(tm.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                teamFilter === tm.name
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tm.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                teamFilter === tm.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {teamTaskCount} tasks
              </span>
            </button>
          );
        })}
      </div>

      {/* KPI Personal Tasks Summary Cards */}
      {(activeTab === 'overview' || activeTab === 'personal') && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Pending Action */}
          <div
            onClick={() => openKpiModal('My Pending & Action Tasks', 'Pending,Triage', 'my_tasks')}
            className="bg-white rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-slate-200 min-h-[160px]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  Requires Attention
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5">Pending Action</span>
              </div>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {myPending}
              </span>
              <div className="flex flex-col">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                  {my.pending || 0} pending
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {my.triage || 0} triage active
                </span>
              </div>
            </div>

            <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-700" /> High impact items
              </span>
              <span className="text-xs text-slate-900 font-bold flex items-center gap-0.5 group-hover:underline transition-all">
                Go to My Tasks <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div
            onClick={() => openKpiModal('My Active In Progress Tasks', 'In Progress,Scheduled', 'my_tasks')}
            className="bg-white rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-slate-200 min-h-[160px]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  Active Focus
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5">In Progress</span>
              </div>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline justify-between my-1">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {myInProg}
                </span>
                <span className="text-xs text-slate-500 font-medium">tasks active</span>
              </div>
              {myInProg > 0 ? (
                <svg className="w-24 h-8 text-slate-900" fill="none" viewBox="0 0 100 32">
                  <path d="M0 24 L16 18 L32 26 L48 10 L64 16 L80 6 L100 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                  <path d="M0 24 L16 18 L32 26 L48 10 L64 16 L80 6 L100 12 V32 H0 Z" fill="currentColor" fillOpacity="0.08"></path>
                </svg>
              ) : (
                <div className="h-8 flex items-center text-xs text-slate-400 font-medium italic">
                  No active velocity
                </div>
              )}
            </div>

            <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100">
              <div className="w-full">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-medium">
                  <span>Progress Velocity</span>
                  <span className="font-bold text-slate-900">
                    {myInProg > 0 ? `${myInProgVelocityPct}% active` : 'No active tasks (0%)'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-900 rounded-full transition-all duration-500" 
                    style={{ width: `${myInProgVelocityPct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Completed / Velocity */}
          <div
            onClick={() => openKpiModal('My Completed Tasks', 'Completed', 'my_tasks')}
            className="bg-white rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group cursor-pointer border border-slate-200 min-h-[160px]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                  Weekly Throughput
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5">Completed</span>
              </div>
              <span className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-black text-slate-900 tracking-tight">
                {myCompleted}
              </span>
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-900 border border-slate-200 text-xs font-bold">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-900" /> {myCompletedPct}% rate
                </span>
              </div>
            </div>

            <div className="pt-3 mt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" /> 
                {myCompleted > 0 ? `${myCompletedPct}% completion rate` : '0% completion rate'}
              </span>
              <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-semibold border border-slate-200">{myTotal} Assigned</span>
            </div>
          </div>

        </section>
      )}

      {/* Team Performance & Workload Section */}
      {(activeTab === 'overview' || activeTab === 'team') && (
        <section className="grid grid-cols-1 lg:grid-cols-12 items-stretch gap-5">
          
          {/* Left Column: Status Distribution & Proportional Bar */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workload Allocation</span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Task Status Distribution</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold border border-slate-200">
                  {teamTotal} Total Items
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold">
                  {teamCompletionRate}% Done
                </span>
              </div>
            </div>

            {/* Segmented Monochrome Progress Bar */}
            <div className="w-full my-2">
              <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500 font-semibold">
                <span>Overall Task Progress</span>
                <span className="text-slate-900 font-bold">{teamCompleted} / {teamTotal} Resolved</span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200">
                <div className="h-full bg-slate-900 rounded-l-full transition-all duration-500" style={{ width: `${teamDonePct}%` }} title={`Done: ${teamCompleted}`}></div>
                <div className="h-full bg-slate-700 transition-all duration-500" style={{ width: `${teamInProgPct}%` }} title={`In Progress: ${teamInProg}`}></div>
                <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${teamTriagePct}%` }} title={`In Review & Triage: ${teamTriage}`}></div>
                <div className="h-full bg-slate-200 rounded-r-full transition-all duration-500" style={{ width: `${teamPendingPct}%` }} title={`Pending: ${teamPending}`}></div>
              </div>
            </div>

            {/* Metric Chips Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 mt-auto">
              {/* Done */}
              <div
                onClick={() => openKpiModal('Team Completed Tasks', 'Completed', 'team_tasks')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                  <span>Done</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900">{teamCompleted}</span>
                  <span className="text-xs text-slate-500 font-semibold">{Math.round(teamDonePct)}%</span>
                </div>
              </div>

              {/* In Progress */}
              <div
                onClick={() => openKpiModal('Team In Progress Tasks', 'In Progress', 'team_tasks')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                  <span>In Progress</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900">{teamInProg}</span>
                  <span className="text-xs text-slate-500 font-semibold">{Math.round(teamInProgPct)}%</span>
                </div>
              </div>

              {/* In Review */}
              <div
                onClick={() => openKpiModal('Team Triage & Review Tasks', 'Triage,Scheduled', 'team_tasks')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  <span>In Review</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900">{teamTriage}</span>
                  <span className="text-xs text-slate-500 font-semibold">{Math.round(teamTriagePct)}%</span>
                </div>
              </div>

              {/* Pending */}
              <div
                onClick={() => openKpiModal('Team Pending Tasks', 'Pending', 'team_tasks')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl flex flex-col gap-1 cursor-pointer transition-colors border border-slate-200"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span>Pending</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-900">{teamPending}</span>
                  <span className="text-xs text-slate-500 font-semibold">{Math.round(teamPendingPct)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Member Workload & Capacity Meters */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 shadow-2xs border border-slate-200 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Staffing & Bandwidth</span>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Team Workload & Capacity</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/teams')}
                className="text-slate-900 hover:underline text-xs font-bold flex items-center gap-0.5 cursor-pointer"
              >
                Manage Team <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Member Rows (Dynamic capacity bar based on task count) */}
            <div className="flex flex-col space-y-3.5 my-auto">
              {displayUserWorkload.length > 0 ? (
                displayUserWorkload.slice(0, 5).map((uw) => {
                  const assignedCount = uw.assigned || 0;
                  const pct = teamTotal > 0 ? Math.round((assignedCount / teamTotal) * 100) : 0;
                  const statusTag = pct > 85 ? 'Near Cap' : pct > 65 ? 'Optimal' : pct > 0 ? 'Balanced' : 'Available';

                  return (
                    <div key={uw.user_id} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {uw.user_name ? uw.user_name.substring(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="font-bold text-slate-900 truncate">{uw.user_name}</span>
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                              {uw.team_name || 'Member'}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-800">
                            {assignedCount} tasks ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div
                            className="h-full rounded-full transition-all duration-500 bg-slate-900"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold shrink-0 bg-slate-100 text-slate-900 border border-slate-200">
                        {statusTag}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs font-medium">
                  No active team members for selected filter.
                </div>
              )}
            </div>
          </div>

        </section>
      )}

      {/* Recent Active Tasks Table / Directory (Full Width Modern Table) */}
      <section className="bg-white rounded-2xl shadow-2xs border border-slate-200/90 overflow-hidden flex flex-col">
        {/* Table Controls Header */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Filter tasks by key, name, or assignee..."
                value={tableFilterSearch}
                onChange={(e) => setTableFilterSearch(e.target.value)}
                className="w-full h-8 pl-9 pr-3 bg-white rounded-lg text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-3 bg-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-2xs shrink-0 cursor-pointer focus:outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Triage">Triage</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 px-3 bg-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-2xs shrink-0 cursor-pointer focus:outline-none"
            >
              <option value="All">Priority: All</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Normal">Normal</option>
            </select>

            {/* Team Filter */}
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="h-8 px-3 bg-white text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 shadow-2xs shrink-0 cursor-pointer focus:outline-none"
            >
              <option value="All">Team: All</option>
              {teamsList.map(tm => (
                <option key={tm.id} value={tm.name}>{tm.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredDirectoryTasks.length} of {tasksToDisplay.length} Active
            </span>
            <button
              type="button"
              onClick={() => navigate('/all-tasks')}
              className="h-8 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All Directory ({tasksToDisplay.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 bg-slate-50/90 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="w-10 px-4 text-center">
                  <input type="checkbox" className="rounded w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                </th>
                <th className="px-4 py-2">Task Title & Details</th>
                <th className="px-4 py-2">Team</th>
                <th className="px-4 py-2">Assigned To</th>
                <th className="px-4 py-2">Time Tracked</th>
                <th className="px-4 py-2">Priority</th>
                <th className="px-4 py-2">Due Date</th>
                <th className="px-4 py-2">Status</th>
                <th className="w-16 px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {filteredDirectoryTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 font-medium">
                    No active tasks match your filters.
                  </td>
                </tr>
              ) : (
                filteredDirectoryTasks.slice(0, 10).map((task) => {
                  const isCompleted = task.status === 'Completed' || task.status === 'Finished';
                  const initial = task.assignee_name ? task.assignee_name.charAt(0).toUpperCase() : 'U';

                  return (
                    <tr
                      key={task.id}
                      className="h-14 hover:bg-slate-50/90 transition-colors group"
                    >
                      <td className="px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          readOnly
                          className="rounded w-3.5 h-3.5 accent-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-2.5 min-w-[260px]">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 mt-0.5">
                            {task.task_id}
                          </span>
                          <div className="flex flex-col">
                            <span
                              onClick={() => setSelectedTaskId(task.id)}
                              className={`font-bold text-slate-900 group-hover:underline transition-all cursor-pointer ${
                                isCompleted ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.description && (
                              <span className="text-[11px] text-slate-500 truncate max-w-md mt-0.5">
                                {task.description}
                              </span>
                            )}
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                              <span className="flex items-center gap-0.5">
                                <MessageSquare className="w-3 h-3 text-slate-400" />
                                {task.comments_count || 0}
                              </span>
                              {task.due_time && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                  {task.due_time}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-medium">
                        {task.team_name ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-500" />
                            {task.team_name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                            {initial}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {task.assignee_name || 'Unassigned'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <TaskTimerBadge task={task} onTimerUpdated={fetchDashboard} />
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {getPriorityBadge(task.priority)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-medium text-slate-600">
                        {task.due_date || 'N/A'}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedTaskId(task.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold border border-slate-200 transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Quick Summary Bar */}
        <div className="px-4 py-2.5 bg-slate-50/90 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium border-t border-slate-200">
          <div className="flex items-center gap-4">
            <span>Filtered Tasks: <strong className="text-slate-800 font-bold">{filteredDirectoryTasks.length}</strong></span>
            <span>Completed Tasks: <strong className="text-slate-800 font-bold">{filteredDirectoryTasks.filter(t => t.status === 'Completed').length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <button type="button" className="px-2 py-1 rounded hover:bg-slate-200 transition-colors cursor-pointer">First</button>
            <button type="button" className="px-2 py-1 rounded bg-slate-200 text-slate-900 font-bold cursor-pointer">1</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-slate-200 transition-colors cursor-pointer">2</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-slate-200 transition-colors cursor-pointer">3</button>
            <button type="button" className="px-2 py-1 rounded hover:bg-slate-200 transition-colors cursor-pointer">Next</button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => fetchDashboard()}
      />

      <KpiTasksModal
        isOpen={kpiModal.isOpen}
        onClose={() => setKpiModal({ ...kpiModal, isOpen: false })}
        title={kpiModal.title}
        statusFilter={kpiModal.statusFilter}
        viewType={kpiModal.viewType}
      />

    </div>
  );
}
