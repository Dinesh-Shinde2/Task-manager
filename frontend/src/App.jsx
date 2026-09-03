import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CreateTaskModal from './components/CreateTaskModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MyTasksPage from './pages/MyTasksPage';
import TeamTasksPage from './pages/TeamTasksPage';
import AllTasksPage from './pages/AllTasksPage';
import CalendarPage from './pages/CalendarPage';
import NotificationsPage from './pages/NotificationsPage';
import UsersPage from './pages/UsersPage';
import TeamsPage from './pages/TeamsPage';
import DeletedTasksPage from './pages/DeletedTasksPage';
import ReportsPage from './pages/ReportsPage';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function MainLayout() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isGlobalCreateOpen, setIsGlobalCreateOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onCreateClick={() => setIsGlobalCreateOpen(true)}
      />

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage searchTerm={searchTerm} setSearchTerm={setSearchTerm} />} />
            <Route path="/my-tasks" element={<MyTasksPage searchTerm={searchTerm} />} />
            <Route path="/team-tasks" element={<TeamTasksPage searchTerm={searchTerm} />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin Routes */}
            <Route path="/all-tasks" element={<ProtectedRoute requireAdmin><AllTasksPage searchTerm={searchTerm} /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requireAdmin><UsersPage /></ProtectedRoute>} />
            <Route path="/teams" element={<ProtectedRoute requireAdmin><TeamsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute requireAdmin><ReportsPage /></ProtectedRoute>} />
            <Route path="/deleted-tasks" element={<ProtectedRoute requireAdmin><DeletedTasksPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <CreateTaskModal
        isOpen={isGlobalCreateOpen}
        onClose={() => setIsGlobalCreateOpen(false)}
        onTaskCreated={() => {
          // Trigger refresh by reloading current page or location
          window.location.reload();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
