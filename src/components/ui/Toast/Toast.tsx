import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.scss';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export const Toast: React.FC<ToastProps> = ({ 
  id,
  variant, 
  message, 
  duration = 5000,
  onClose
}) => {
  const Icon = iconMap[variant];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div 
      className={`${styles.toast} ${styles[variant]}`}
      role="alert"
    >
      <div className={styles.iconWrapper}>
        <Icon size={20} className={styles.icon} />
      </div>
      <div className={styles.message}>{message}</div>
      <button 
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

