import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button/Button';
import { Building2, Shield, User as UserIcon, Bell } from 'lucide-react';
import { User, UserRole } from '../../types/auth.types';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  currentUser: User | null;
  onLogout: () => void;
}

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return <Shield size={16} />;
    case UserRole.BUSINESS_OWNER:
      return <Building2 size={16} />;
    case UserRole.MANAGER:
      return <UserIcon size={16} />;
    case UserRole.VIEWER:
      return <UserIcon size={16} />;
    default:
      return <UserIcon size={16} />;
  }
};

const getRoleName = (role: UserRole) => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Admin';
    case UserRole.BUSINESS_OWNER:
      return 'Właściciel Biznesu';
    case UserRole.MANAGER:
      return 'Menedżer';
    case UserRole.VIEWER:
      return 'Przeglądający';
    default:
      return 'Użytkownik';
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onLogout }) => {
  return (
    <div className={styles.sidebar} id="sidebar">
      <div className={styles.sidebarHeader}>
        <Building2 size={24} />
        <h2>Admin Panel</h2>
      </div>
      
      {currentUser && (
        <div className={styles.userInfo}>
          <div className={styles.userRole}>
            {getRoleIcon(currentUser.role)}
            <span>{getRoleName(currentUser.role)}</span>
          </div>
          <div className={styles.userEmail}>
            {currentUser.email}
          </div>
          {currentUser.tenant_id && (
            <div className={styles.userTenant}>
              Tenant ID: {currentUser.tenant_id}
            </div>
          )}
        </div>
      )}
      
      <nav className={styles.sidebarNav}>
        <Link to="/" className={styles.navItem} id="nav-dashboard">
          Dashboard
        </Link>
        <Link to="/locations" className={styles.navItem} id="nav-locations">
          Lokalizacje
        </Link>
        <Link to="/campaigns" className={styles.navItem} id="nav-campaigns">
          <Bell size={16} />
          Kampanie Push
        </Link>
        <Link to="/customers" className={styles.navItem} id="nav-customers">
          Klienci
        </Link>
        <Link to="/program" className={styles.navItem} id="nav-program">
          Program
        </Link>
        {currentUser?.role === UserRole.SUPER_ADMIN && (
          <>
            <Link to="/pending-businesses" className={styles.navItem} id="nav-pending">
              Oczekujące biznesy
            </Link>
            <Link to="/users" className={styles.navItem} id="nav-users">
              Użytkownicy
            </Link>
          </>
        )}
        <Link to="/settings" className={styles.navItem} id="nav-settings">
          Ustawienia
        </Link>
      </nav>
      
      <div className={styles.sidebarFooter}>
        <Button variant="outline" onClick={onLogout} id="logout-btn">
          Wyloguj się
        </Button>
      </div>
    </div>
  );
};

