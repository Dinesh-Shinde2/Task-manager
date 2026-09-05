import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { 
  Search, 
  Plus, 
  Bell, 
  HelpCircle, 
  User, 
  ChevronDown, 
  LogOut, 
  CheckCheck 
} from 'lucide-react';

export default function Navbar({ onSearchChange, searchTerm, onCreateClick }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-13 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 shadow-sm">
      
      {/* Left Search Bar with shortcut badge */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks, projects, people..."
            value={searchTerm || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full h-8 pl-9 pr-12 bg-slate-100/70 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white border border-slate-200/60 transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs font-semibold">
            ⌘K
          </span>
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        
        {/* Create Task Button */}
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="h-8 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Task</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifPopover(!showNotifPopover);
              setShowUserDropdown(false);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors ${notif.is_read ? 'bg-white' : 'bg-blue-50/40'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Help Button */}
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          title="Help & Info"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Profile Badge & Dropdown */}
        <div className="relative">
          <div
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifPopover(false);
            }}
            className="flex items-center gap-2 pl-1.5 py-1 pr-2 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.name || 'Dinesh'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium leading-tight">
                {user?.role === 'Admin' ? 'Manager / Admin' : (user?.role || 'Team Member')}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>

          {/* User Logout Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{user?.user_id} • {user?.team_name || 'No Team'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
}
