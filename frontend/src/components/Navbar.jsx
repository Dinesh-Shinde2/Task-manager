import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI, taskAPI, userAPI } from '../services/api';
import { 
  Search, 
  Plus, 
  Bell, 
  User, 
  ChevronDown, 
  LogOut, 
  CheckCheck,
  X,
  CheckSquare,
  Users,
  Loader2
} from 'lucide-react';
import TaskDetailModal from './TaskDetailModal';

export default function Navbar({ onSearchChange, searchTerm, onCreateClick }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Search Live Overlay & Keyboard Shortcut state
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({ tasks: [], users: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowSearchDropdown(true);
      } else if (e.key === 'Escape') {
        setShowSearchDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
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

  // Perform Live Search when searchTerm changes
  useEffect(() => {
    if (!searchTerm || !searchTerm.trim()) {
      setSearchResults({ tasks: [], users: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const [tRes, uRes] = await Promise.all([
          taskAPI.getTasks({ search: searchTerm.trim() }),
          userAPI.getUsers()
        ]);

        const query = searchTerm.toLowerCase().trim();
        const matchedTasks = Array.isArray(tRes.data) ? tRes.data.slice(0, 6) : [];
        const matchedUsers = Array.isArray(uRes.data)
          ? uRes.data.filter(u =>
              (u.name || '').toLowerCase().includes(query) ||
              (u.user_id || '').toLowerCase().includes(query) ||
              (u.email || '').toLowerCase().includes(query) ||
              (u.team_name || '').toLowerCase().includes(query)
            ).slice(0, 3)
          : [];

        setSearchResults({ tasks: matchedTasks, users: matchedUsers });
        setShowSearchDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearSearch = () => {
    if (onSearchChange) onSearchChange('');
    setShowSearchDropdown(false);
    inputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 flex items-center justify-between px-6 shadow-xs relative">
      
      {/* Left side brand tag */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-black tracking-tight uppercase text-slate-400 hidden lg:inline-block">
          Task Workspace
        </span>
      </div>

      {/* Center Search Bar - Perfectly Centered in Header */}
      <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tasks, projects, people... (⌘K)"
            value={searchTerm || ''}
            onFocus={() => { if (searchTerm) setShowSearchDropdown(true); }}
            onChange={(e) => {
              onSearchChange && onSearchChange(e.target.value);
              if (e.target.value.trim()) setShowSearchDropdown(true);
            }}
            className="w-full h-9 pl-9 pr-14 bg-slate-100/90 hover:bg-slate-100 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:bg-white border border-slate-200/90 font-medium transition-all shadow-2xs"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchTerm ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="bg-white text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-200 shadow-2xs font-bold pointer-events-none">
                ⌘K
              </span>
            )}
          </div>

          {/* Live Search Dropdown Popover */}
          {showSearchDropdown && searchTerm && searchTerm.trim() && (
            <div
              ref={dropdownRef}
              className="absolute left-0 right-0 top-11 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95"
            >
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Search Results for "{searchTerm}"</span>
                {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
                
                {/* Tasks Section */}
                {searchResults.tasks.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CheckSquare className="w-3 h-3 text-slate-700" /> Tasks ({searchResults.tasks.length})
                    </div>
                    {searchResults.tasks.map(t => (
                      <div
                        key={t.id}
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setShowSearchDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <p className="font-bold text-slate-900 group-hover:text-black truncate">{t.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>{t.task_id}</span>
                            {t.team_name && <span>• {t.team_name}</span>}
                            {t.assigned_to_name && <span>• Assigned: {t.assigned_to_name}</span>}
                          </p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                          t.status === 'Completed' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Users Section */}
                {searchResults.users.length > 0 && (
                  <div className="py-2">
                    <div className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-700" /> Team Members ({searchResults.users.length})
                    </div>
                    {searchResults.users.map(u => (
                      <div
                        key={u.id}
                        className="px-4 py-1.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({u.user_id})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{u.role} {u.team_name ? `• ${u.team_name}` : ''}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* No results state */}
                {!isSearching && searchResults.tasks.length === 0 && searchResults.users.length === 0 && (
                  <div className="p-6 text-center text-slate-400 font-medium text-xs">
                    No matching tasks or members found for "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        
        {/* Create Task Button */}
        {onCreateClick && (
          <button
            onClick={onCreateClick}
            className="h-9 px-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Create Task</span>
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-200 mx-0.5"></div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifPopover(!showNotifPopover);
              setShowUserDropdown(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors relative cursor-pointer border border-slate-200/80 bg-white"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-900" />
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-slate-100 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-slate-900 hover:underline font-bold flex items-center gap-1 cursor-pointer"
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
                      className={`p-3.5 transition-colors ${notif.is_read ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-bold text-slate-900">{notif.title}</p>
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

        {/* User Profile Badge & Dropdown */}
        <div className="relative">
          <div
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotifPopover(false);
            }}
            className="flex items-center gap-2.5 pl-1.5 py-1 pr-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
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
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{user?.user_id} • {user?.team_name || 'No Team'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-black transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Task Detail Modal for Live Search Result */}
      <TaskDetailModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => {
          if (onSearchChange && searchTerm) {
            onSearchChange(searchTerm);
          }
        }}
      />

    </header>
  );
}
