import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskAPI, teamAPI, userAPI } from '../services/api';
import { Users, Layers, LayoutGrid } from 'lucide-react';
import TaskDetailModal from '../components/TaskDetailModal';
import TaskWorkspace from '../components/TaskWorkspace';

export default function TeamTasksPage({ searchTerm }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  
  // Team filter state: 'all' or team id string
  const [selectedTeamId, setSelectedTeamId] = useState('all');
  
  // Display layout mode: 'workspace' (standard Kanban/Table) or 'grouped' (Grouped by Team cards)
  const [viewMode, setViewMode] = useState('workspace'); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, teamRes, uRes] = await Promise.all([
        taskAPI.getTasks({ view_type: 'team_tasks' }),
        teamAPI.getTeams(),
        userAPI.getUsers()
      ]);
      setTasks(tRes.data);
      setTeams(teamRes.data);
      setUsersList(uRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const safeTeams = Array.isArray(teams) ? teams : [];

  const isAdmin = user?.role === 'Admin';

  const isUserInTeam = (t) => {
    if (!user) return false;
    if (user.team_id && t.id === user.team_id) return true;
    if (user.team_name && t.name === user.team_name) return true;
    if (Array.isArray(t.members) && t.members.some(m => m.id === user.id || m.user_id === user.user_id)) return true;
    return false;
  };

  const displayTeams = isAdmin 
    ? safeTeams 
    : safeTeams.filter(isUserInTeam);

  // Set default team tab for non-admin users
  useEffect(() => {
    if (!loading && safeTeams.length > 0 && !isAdmin) {
      const myTeam = displayTeams[0];
      if (myTeam) {
        if (selectedTeamId === 'all' || !displayTeams.some(t => String(t.id) === selectedTeamId)) {
          setSelectedTeamId(String(myTeam.id));
        }
      } else {
        setSelectedTeamId('unassigned');
      }
    }
  }, [loading, teams, user, isAdmin]);

  // Filter tasks by search term
  const searchedTasks = searchTerm
    ? safeTasks.filter(t => (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (t.task_id || '').toLowerCase().includes(searchTerm.toLowerCase()))
    : safeTasks;

  // Filter tasks by selected team tab
  const filteredTasks = selectedTeamId === 'all'
    ? searchedTasks
    : selectedTeamId === 'unassigned'
    ? searchedTasks.filter(t => !t.team_id && !t.team_name)
    : searchedTasks.filter(t => t.team_id === parseInt(selectedTeamId) || (safeTeams.find(tm => tm.id === parseInt(selectedTeamId))?.name === t.team_name));

  // Active non-completed tasks filter helper
  const isTaskActive = (t) => t.status !== 'Completed' && t.status !== 'Closed' && t.status !== 'Deleted';

  // Count active non-completed tasks per team
  const getTeamTaskCount = (tId) => {
    const activeTasks = searchedTasks.filter(isTaskActive);

    if (tId === 'all') return activeTasks.length;
    if (tId === 'unassigned') return activeTasks.filter(t => !t.team_id && !t.team_name).length;

    const targetTeam = safeTeams.find(tm => tm.id === parseInt(tId));
    return activeTasks.filter(t => 
      t.team_id === parseInt(tId) || 
      (targetTeam && targetTeam.name === t.team_name)
    ).length;
  };

  // Currently active team details for sub-header
  const activeTeamObj = safeTeams.find(t => t.id === parseInt(selectedTeamId));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-slate-900" /> Team Tasks & Workload Separation
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            {isAdmin && selectedTeamId === 'all' ? (
              <span>Overview across <span className="font-bold text-slate-800">{safeTeams.length} Registered Teams</span> ({getTeamTaskCount('all')} Active Tasks)</span>
            ) : activeTeamObj ? (
              <span>Tasks isolated for <span className="font-bold text-slate-800">{activeTeamObj.name}</span> · Team Lead: <span className="font-semibold text-slate-800">{activeTeamObj.team_lead_name || 'Unassigned'}</span> ({activeTeamObj.members_count || 0} members · {getTeamTaskCount(selectedTeamId)} active tasks)</span>
            ) : (
              <span>Viewing unassigned team workload ({getTeamTaskCount('unassigned')} active tasks)</span>
            )}
          </p>
        </div>

        {/* View Mode Toggle: Standard Board vs Grouped by Team */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('workspace')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'workspace' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Standard Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grouped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'grouped' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Group by Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* TEAM SEPARATION SWITCHER BAR (TABS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-700" /> {isAdmin ? `Select Team Filter (${displayTeams.length} Teams Registered)` : `My Team (${displayTeams.length} Assigned)`}
          </span>

          {/* Responsive Select Dropdown */}
          <div className="sm:hidden relative w-56">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full px-2.5 py-1 text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg focus:outline-none"
            >
              {isAdmin && <option value="all">All Teams ({safeTeams.length} Teams / {getTeamTaskCount('all')} Active Tasks)</option>}
              {displayTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({getTeamTaskCount(t.id)} active tasks)</option>
              ))}
              {(isAdmin || displayTeams.length === 0) && <option value="unassigned">Unassigned ({getTeamTaskCount('unassigned')} active tasks)</option>}
            </select>
          </div>
        </div>

        {/* Horizontal Tab Pills (Desktop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setSelectedTeamId('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                selectedTeamId === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span>All Teams ({safeTeams.length})</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedTeamId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {getTeamTaskCount('all')} Active Tasks
              </span>
            </button>
          )}

          {displayTeams.map(t => {
            const isSelected = selectedTeamId === String(t.id);
            const count = getTeamTaskCount(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTeamId(String(t.id))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{t.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                  {count} Active Tasks
                </span>
              </button>
            );
          })}

          {(isAdmin || displayTeams.length === 0) && (
            <button
              type="button"
              onClick={() => setSelectedTeamId('unassigned')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border cursor-pointer ${
                selectedTeamId === 'unassigned'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <span>Unassigned Team</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedTeamId === 'unassigned' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {getTeamTaskCount('unassigned')} Active Tasks
              </span>
            </button>
          )}
        </div>
      </div>

      {/* WORKSPACE VIEWS */}
      {viewMode === 'workspace' ? (
        /* Standard Kanban Board / Table Workspace */
        <TaskWorkspace
          tasks={filteredTasks}
          loading={loading}
          onTaskUpdated={fetchData}
          onSelectTask={(id) => setSelectedTaskId(id)}
          usersList={usersList}
        />
      ) : (
        /* Grouped by Team Card Sections */
        <div className="space-y-6">
          {displayTeams.map(team => {
            const teamTasksList = searchedTasks.filter(t => t.team_id === team.id || t.team_name === team.name);
            return (
              <div key={team.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-slate-900" />
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Lead: <span className="font-bold text-slate-800">{team.team_lead_name || 'Unassigned'}</span> · {team.members_count || 0} Members
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold">
                    {teamTasksList.length} Tasks
                  </span>
                </div>

                <TaskWorkspace
                  tasks={teamTasksList}
                  loading={loading}
                  onTaskUpdated={fetchData}
                  onSelectTask={(id) => setSelectedTaskId(id)}
                  usersList={usersList}
                />
              </div>
            );
          })}

          {/* Unassigned Tasks Group */}
          {(isAdmin || displayTeams.length === 0) && searchedTasks.filter(t => !t.team_id && !t.team_name).length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    Unassigned Team Tasks
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Tasks that have not been assigned to a specific team
                  </p>
                </div>

                <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-bold">
                  {searchedTasks.filter(t => !t.team_id && !t.team_name).length} Tasks
                </span>
              </div>

              <TaskWorkspace
                tasks={searchedTasks.filter(t => !t.team_id && !t.team_name)}
                loading={loading}
                onTaskUpdated={fetchData}
                onSelectTask={(id) => setSelectedTaskId(id)}
                usersList={usersList}
              />
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchData}
      />

    </div>
  );
}
