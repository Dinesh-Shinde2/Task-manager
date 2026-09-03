import React, { useState, useEffect } from 'react';
import { teamAPI, userAPI } from '../services/api';
import { FolderKanban, Plus, UserPlus, UserMinus, X, Check, AlertCircle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [dialogError, setDialogError] = useState({ isOpen: false, title: '', message: '' });

  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamLeadId, setNewTeamLeadId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [addMemberUserId, setAddMemberUserId] = useState('');

  const fetchTeamsAndUsers = async () => {
    try {
      setLoading(true);
      const [tRes, uRes] = await Promise.all([teamAPI.getTeams(), userAPI.getUsers()]);
      setTeams(tRes.data);
      setAllUsers(uRes.data);
      if (selectedTeam) {
        const updated = tRes.data.find(t => t.id === selectedTeam.id);
        if (updated) setSelectedTeam(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamsAndUsers();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setError("Team Name is required");
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await teamAPI.createTeam({
        name: newTeamName,
        description: newTeamDesc,
        status: 'Active',
        team_lead_id: newTeamLeadId ? parseInt(newTeamLeadId) : null
      });
      setIsCreateOpen(false);
      setNewTeamName('');
      setNewTeamDesc('');
      setNewTeamLeadId('');
      fetchTeamsAndUsers();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !addMemberUserId) return;
    try {
      await teamAPI.addMember(selectedTeam.id, parseInt(addMemberUserId));
      setAddMemberUserId('');
      fetchTeamsAndUsers();
    } catch (err) {
      setDialogError({
        isOpen: true,
        title: "Action Failed",
        message: err.response?.data?.detail || "Failed to add member"
      });
    }
  };

  const handleRemoveMember = async (userDbId) => {
    if (!selectedTeam) return;
    try {
      await teamAPI.removeMember(selectedTeam.id, userDbId);
      fetchTeamsAndUsers();
    } catch (err) {
      setDialogError({
        isOpen: true,
        title: "Action Failed",
        message: err.response?.data?.detail || "Failed to remove member"
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-600" /> Team Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Admin team creation, membership allocation, and team lead assignment
          </p>
        </div>

        <button
          onClick={() => { setIsCreateOpen(true); setError(''); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Team
        </button>
      </div>

      {/* Main Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Teams Table matching Section 9 */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <h2 className="font-bold text-slate-800 text-sm">Teams</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-400 font-medium">Loading Teams...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Team Name</th>
                    <th className="py-3 px-5">Members</th>
                    <th className="py-3 px-5">Team Lead</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {teams.map((t) => (
                    <tr
                      key={t.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        selectedTeam?.id === t.id ? 'bg-purple-50/60 font-semibold' : ''
                      }`}
                      onClick={() => setSelectedTeam(t)}
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {t.name}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium">
                        {t.members_count} members
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 font-medium text-xs">
                        {t.team_lead_name || 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          t.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedTeam(t)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-semibold"
                        >
                          Manage Members →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Team Details / Member Management Side Panel matching Section 9 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          {selectedTeam ? (
            <div>
              <div className="border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-slate-800 text-lg">{selectedTeam.name} Team</h3>
                <p className="text-xs text-slate-500">{selectedTeam.description || 'No description'}</p>
                <p className="text-xs text-purple-700 font-medium mt-1">Team Lead: {selectedTeam.team_lead_name || 'None'}</p>
              </div>

              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 mb-3">
                Team Members ({selectedTeam.members.length})
              </h4>

              {/* Members Checklist */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4 border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                {selectedTeam.members.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No members in this team</p>
                ) : (
                  selectedTeam.members.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 font-bold">☑</span>
                        <span className="font-semibold text-slate-800">{m.name}</span>
                        <span className="text-[10px] text-slate-400">({m.user_id})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(m.id)}
                        className="text-rose-600 hover:text-rose-800 text-[10px] font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Add Member
                </label>
                <div className="flex gap-2">
                  <select
                    value={addMemberUserId}
                    onChange={(e) => setAddMemberUserId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="">-- Select User --</option>
                    {allUsers
                      .filter(u => u.team_id !== selectedTeam.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.user_id})
                        </option>
                      ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!addMemberUserId}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              Click a team on the left to manage members.
            </div>
          )}
        </div>

      </div>

      {/* Create Team Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Create New Team</h2>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeam} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure Team"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Team scope or responsibilities..."
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Team Lead
                </label>
                <select
                  value={newTeamLeadId}
                  onChange={(e) => setNewTeamLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                >
                  <option value="">-- Select Team Lead --</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.user_id})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
  );
}
