import React from 'react';
import styles from './Drawer.module.scss';

interface DrawerBodyProps {
  children: React.ReactNode;
}

export const DrawerBody: React.FC<DrawerBodyProps> = ({ children }) => {
  return (
    <div className={styles.drawerBody}>
      {children}
    </div>
  );
};

