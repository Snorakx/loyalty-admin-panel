import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RegisterView } from './views/RegisterView';
import { OnboardingView } from './views/OnboardingView';
import { PendingBusinessesView } from './views/PendingBusinessesView';
import { BusinessApprovalView } from './views/BusinessApprovalView';
import { LoginForm } from './components/auth/LoginForm';
import { LoadingScreen } from './components/auth/LoadingScreen';
import { MainLayout } from './components/layout/MainLayout';
import { AuthService } from './services/auth.service';
import { User, UserRole } from './types/auth.types';
import { ToastProvider } from './contexts/ToastContext';
import { createLogger } from './utils/logger';

const logger = createLogger('App');

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authService] = useState(() => AuthService.getInstance());

  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) {
      logger.debug('App - auth already checked, skipping');
      return;
    }
    
    hasCheckedAuth.current = true;
    
    const checkAuth = async () => {
      logger.info('App initializing, checking authentication...');
      
      try {
        const user = await authService.fetchCurrentUser();
        
        
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          logger.success('App initialized with authenticated user');
        } else {
          logger.info('App initialized, user not authenticated');
        }
      } catch (error) {
        logger.error('Failed to check authentication', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []); // Empty dependency array

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = await authService.login(loginData.email, loginData.password);
      
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Błąd logowania';
      logger.error('Login failed in App component', error);
      alert(message);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      logger.error('Logout failed', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/register" element={<RegisterView />} />
            <Route path="*" element={
              <LoginForm
                email={loginData.email}
                password={loginData.password}
                onEmailChange={(value) => setLoginData(prev => ({ ...prev, email: value }))}
                onPasswordChange={(value) => setLoginData(prev => ({ ...prev, password: value }))}
                onSubmit={handleLogin}
              />
            } />
          </Routes>
        </Router>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<RegisterView />} />
          
          {/* Protected routes */}
          <Route path="/onboarding" element={
            isAuthenticated ? <OnboardingView /> : <Navigate to="/login" replace />
          } />
          
          {/* Super Admin only routes */}
          <Route path="/pending-businesses" element={
            isAuthenticated && currentUser?.role === UserRole.SUPER_ADMIN 
              ? <PendingBusinessesView /> 
              : <Navigate to="/" replace />
          } />
          <Route path="/pending-businesses/:tenantId" element={
            isAuthenticated && currentUser?.role === UserRole.SUPER_ADMIN 
              ? <BusinessApprovalView /> 
              : <Navigate to="/" replace />
          } />
          
          {/* Redirect root to dashboard for authenticated users */}
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          } />
          
          {/* Main app with sidebar */}
          <Route path="/*" element={
            isAuthenticated ? (
              <MainLayout currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;
