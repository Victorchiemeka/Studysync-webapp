import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import StudyGroups from './components/StudyGroupsNew';
import Chat from './components/Chat';
import ChatDetail from './components/ChatDetail';
import Calendar from './components/Calendar';
import MapView from './components/MapView';
import AiMatching from './components/AiMatching';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireProfile = false }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated || !user) {
    window.location.href = '/login';
    return null;
  }
  
  if (requireProfile && (!user.profileCompleted || !user.major)) {
    window.location.href = '/setup';
    return null;
  }
  
  return children;
};

// Auth Route Component (redirect if already authenticated)
const AuthRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated && user) {
    if (!user.profileCompleted || !user.major) {
      window.location.href = '/setup';
      return null;
    } else {
      window.location.href = '/dashboard';
      return null;
    }
  }
  
  return children;
};

// Component to handle OAuth redirects
const OAuthRedirect = () => {
  React.useEffect(() => {
    // Redirect to backend for OAuth handling
    const currentPath = window.location.pathname + window.location.search;
    window.location.href = `http://localhost:8081${currentPath}`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-blue-600 mx-auto"></div>
        <p className="mt-4 text-neutral-600">Redirecting to authentication...</p>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10B981',
            },
          },
          error: {
            style: {
              background: '#EF4444',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
        <Route path="/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requireProfile={true}><Dashboard /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute requireProfile={true}><StudyGroups /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute requireProfile={true}><Chat /></ProtectedRoute>} />
        <Route path="/chat/:matchId" element={<ProtectedRoute requireProfile={true}><ChatDetail /></ProtectedRoute>} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/ai-matching" element={<ProtectedRoute requireProfile={true}><AiMatching /></ProtectedRoute>} />
        {/* Catch OAuth redirects and redirect to backend */}
        <Route path="/oauth2/*" element={<OAuthRedirect />} />
        {/* Catch-all route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
