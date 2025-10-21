import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Alert.module.scss';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export const Alert: React.FC<AlertProps> = ({ 
  variant, 
  title, 
  message, 
  onClose,
  className 
}) => {
  const Icon = iconMap[variant];

  return (
    <div 
      className={`${styles.alert} ${styles[variant]} ${className || ''}`}
      role="alert"
    >
      <div className={styles.iconWrapper}>
        <Icon size={20} className={styles.icon} />
      </div>
      <div className={styles.content}>
        {title && <div className={styles.title}>{title}</div>}
        <div className={styles.message}>{message}</div>
      </div>
      {onClose && (
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

