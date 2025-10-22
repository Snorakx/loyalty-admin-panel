import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { DashboardView } from '../../views/DashboardView';
import { SettingsView } from '../../views/SettingsView';
import { User } from '../../types/auth.types';
import styles from './MainLayout.module.scss';

interface MainLayoutProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, onLogout }) => {
  return (
    <div className={styles.app} id="main-app-container">
      <Sidebar currentUser={currentUser} onLogout={onLogout} />
      
      <div className={styles.mainContent}>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/locations" element={<div>Locations View (TODO)</div>} />
          <Route path="/customers" element={<div>Customers View (TODO)</div>} />
          <Route path="/program" element={<div>Program View (TODO)</div>} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

