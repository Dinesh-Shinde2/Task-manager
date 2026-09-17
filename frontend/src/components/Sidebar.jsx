import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { taskAPI, notificationAPI } from '../services/api';
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

  const [myTasksCount, setMyTasksCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  useEffect(() => {
    if (user) {
      taskAPI.getTasks({ view_type: 'my_tasks' })
        .then(res => {
          const pending = res.data.filter(t => t.status !== 'Completed');
          setMyTasksCount(pending.length);
        })
        .catch(() => {});

      notificationAPI.getNotifications()
        .then(res => {
          setUnreadNotifCount(res.data.filter(n => !n.is_read).length);
        })
        .catch(() => {});
    }
  }, [user]);

  const navLinkClass = ({ isActive }) =>
    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
    }`;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between z-50 overflow-y-auto">
      <div className="flex flex-col space-y-6">
        
        {/* Logo Header */}
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-xs">
            T
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-slate-900">
                Task Manager
              </span>
              <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[9px] px-1.5 py-0.2 rounded uppercase tracking-wider font-bold">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Enterprise Suite</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div>
          <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Navigation
          </span>
          <nav className="mt-2 flex flex-col space-y-1">
            <NavLink to="/" end className={navLinkClass}>
              {({ isActive }) => (
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                  <span>Dashboard</span>
                </div>
              )}
            </NavLink>

            <NavLink to="/my-tasks" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    <span>My Tasks</span>
                  </div>
                  {myTasksCount > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                      {myTasksCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink to="/team-tasks" className={navLinkClass}>
              {({ isActive }) => (
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                  <span>Team Tasks</span>
                </div>
              )}
            </NavLink>

            {isAdmin && (
              <NavLink to="/all-tasks" className={navLinkClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <ListTodo className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    <span>All Tasks</span>
                  </div>
                )}
              </NavLink>
            )}

            <NavLink to="/calendar" className={navLinkClass}>
              {({ isActive }) => (
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                  <span>Calendar</span>
                </div>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div>
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Administration
            </span>
            <nav className="mt-2 flex flex-col space-y-1">
              <NavLink to="/teams" className={navLinkClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    <span>Teams</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/users" className={navLinkClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <UserCheck className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    <span>Users</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/reports" className={navLinkClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    <span>Reports</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/deleted-tasks" className={navLinkClass}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <Trash2 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                    <span>Trash</span>
                  </div>
                )}
              </NavLink>
            </nav>
          </div>
        )}

      </div>

      {/* Role Footer */}
      <div className="pt-4 border-t border-slate-200 text-[11px] font-medium px-2">
        <p className="font-bold text-slate-900">{user?.name}</p>
        <p className="text-slate-500">{user?.role} • {user?.team_name || 'Enterprise'}</p>
      </div>
    </aside>
  );
}
