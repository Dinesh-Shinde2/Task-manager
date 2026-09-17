import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium text-sm">
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
    <div className="min-h-screen bg-slate-50 flex text-slate-900 antialiased">
      
      {/* Fixed Sidebar on the left (top-0 to bottom-0) */}
      <Sidebar />

      {/* Main Content Area pushed to the right of fixed Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        <Navbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onCreateClick={() => setIsGlobalCreateOpen(true)}
        />

        <main className="flex-1 px-8 py-6 bg-slate-50">
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
          window.location.reload();
        }}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary Caught An Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-900 text-white font-bold rounded-xl mx-auto flex items-center justify-center text-lg">
              !
            </div>
            <h2 className="text-lg font-bold text-slate-900">Application Notice</h2>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {this.state.error?.message || 'An unexpected rendering error occurred. Click reload to refresh session.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer"
              >
                Reload Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}
