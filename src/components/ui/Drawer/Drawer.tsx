import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Drawer.module.scss';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  // Blokuj scroll gdy drawer jest otwarty i zapobiegaj skokowi ekranu
  useEffect(() => {
    if (isOpen) {
      // Oblicz szerokość scrollbar i skompensuj ją
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Ustaw overflow hidden i skompensuj szerokość scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Przywróć oryginalne style
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  // Obsługa klawiatury (ESC)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <div className={`${styles.drawer} ${className}`}>
        {/* Header */}
        {(title || true) && (
          <div className={styles.header}>
            {title && (
              <h2 className={styles.title}>{title}</h2>
            )}
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Zamknij"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>
  );
};