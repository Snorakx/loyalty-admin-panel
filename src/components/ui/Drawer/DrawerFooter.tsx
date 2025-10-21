import React from 'react';
import styles from './Drawer.module.scss';

interface DrawerFooterProps {
  children: React.ReactNode;
}

export const DrawerFooter: React.FC<DrawerFooterProps> = ({ children }) => {
  return (
    <div className={styles.drawerFooter}>
      {children}
    </div>
  );
};

