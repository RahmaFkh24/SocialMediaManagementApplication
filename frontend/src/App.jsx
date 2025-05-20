import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import OnboardingPage from '@/pages/OnboardingPage';
import Inbox from './pages/Inbox';
import DashboardPage from '@/pages/DashboardPage';
import CalendarPage from '@/pages/CalendarPage';
import SchedulerPage from '@/pages/SchedulerPage';
import PostsPage from '@/pages/PostsPage';
import MediaPage from '@/pages/MediaPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import AccountsPage from '@/pages/AccountsPage';
import SettingsPage from '@/pages/SettingsPage';
import { Toaster } from "@/components/ui/toaster";



// Helpers
const getIsNewUser = () => localStorage.getItem('isNewUser') === 'true';

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isNewUser = getIsNewUser();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isNewUser) return <Navigate to="/onboarding" replace />;

  return children;
};

// OnboardingRoute component
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isNewUser = getIsNewUser();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isNewUser) return <Navigate to="/dashboard" replace />;

  return children;
};

// PublicOnlyRoute component
const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const isNewUser = getIsNewUser();

  if (isAuthenticated) {
    return isNewUser ? <Navigate to="/onboarding" replace /> : <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (

    <>

      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />

          {/* Onboarding Route */}
          <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />

          {/* Protected Routes inside Layout */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="scheduler" element={<ProtectedRoute><SchedulerPage /></ProtectedRoute>} />
            <Route path="posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
            <Route path="media" element={<ProtectedRoute><MediaPage /></ProtectedRoute>} />
            <Route path="analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <Toaster />
    </>

  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
