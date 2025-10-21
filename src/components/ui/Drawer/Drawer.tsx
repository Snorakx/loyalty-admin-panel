import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Drawer.module.scss';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  side = 'right',
  width = '500px'
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={styles.overlay} 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={`${styles.drawer} ${styles[side]}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        <div className={styles.header}>
          <h2 id="drawer-title" className={styles.title}>{title}</h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};

