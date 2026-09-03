import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  ListTodo, 
  Calendar as CalendarIcon, 
  Bell, 
  FolderKanban, 
  UserCheck, 
  BarChart3, 
  Trash2 
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';

  const navItemClass = ({ isActive }) => 
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive 
        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20 translate-x-1' 
        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between shrink-0 shadow-sm">
      <div className="space-y-6">
        
        {/* Workspace section */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Main Menu
          </p>
          <nav className="space-y-1">
            <NavLink to="/" end className={navItemClass}>
              {({ isActive }) => (
                <>
                  <LayoutDashboard className={`h-4 w-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                  <span>Dashboard</span>
                </>
              )}
            </NavLink>

            <NavLink to="/my-tasks" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <CheckSquare className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>My Tasks</span>
                </>
              )}
            </NavLink>

            <NavLink to="/team-tasks" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <Users className={`h-4 w-4 ${isActive ? 'text-white' : 'text-indigo-600'}`} />
                  <span>Team Tasks</span>
                </>
              )}
            </NavLink>

            {isAdmin && (
              <NavLink to="/all-tasks" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    <ListTodo className={`h-4 w-4 ${isActive ? 'text-white' : 'text-cyan-600'}`} />
                    <span>All Tasks</span>
                  </>
                )}
              </NavLink>
            )}

            <NavLink to="/calendar" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <CalendarIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                  <span>Calendar</span>
                </>
              )}
            </NavLink>

            <NavLink to="/notifications" className={navItemClass}>
              {({ isActive }) => (
                <>
                  <Bell className={`h-4 w-4 ${isActive ? 'text-white' : 'text-rose-500'}`} />
                  <span>Notifications</span>
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Admin Management Section */}
        {isAdmin && (
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Administration
            </p>
            <nav className="space-y-1">
              <NavLink to="/teams" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    <FolderKanban className={`h-4 w-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                    <span>Teams</span>
                  </>
                )}
              </NavLink>

              <NavLink to="/users" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    <UserCheck className={`h-4 w-4 ${isActive ? 'text-white' : 'text-teal-600'}`} />
                    <span>Users</span>
                  </>
                )}
              </NavLink>

              <NavLink to="/reports" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    <BarChart3 className={`h-4 w-4 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                    <span>Reports</span>
                  </>
                )}
              </NavLink>

              <NavLink to="/deleted-tasks" className={navItemClass}>
                {({ isActive }) => (
                  <>
                    <Trash2 className={`h-4 w-4 ${isActive ? 'text-white' : 'text-rose-600'}`} />
                    <span>Deleted Tasks</span>
                  </>
                )}
              </NavLink>
            </nav>
          </div>
        )}

      </div>

      {/* Footer info box */}
      <div className="pt-4 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-500">
          <p className="font-bold text-slate-700">Role Permissions</p>
          <p className="mt-0.5">Logged in as <span className="font-semibold text-slate-800">{user?.role}</span></p>
        </div>
      </div>
    </aside>
  );
}
