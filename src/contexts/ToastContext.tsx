import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer } from '../components/ui/Toast/ToastContainer';
import { ToastVariant } from '../components/ui/Toast/Toast';

interface ToastData {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((variant: ToastVariant, message: string, duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastData = { id, variant, message, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addToast('success', message, duration);
  }, [addToast]);

  const showError = useCallback((message: string, duration?: number) => {
    addToast('error', message, duration);
  }, [addToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addToast('warning', message, duration);
  }, [addToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addToast('info', message, duration);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showWarning, showInfo, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  
  return context;
};

