import React from 'react';
import styles from './LoadingScreen.module.scss';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Ładowanie...' 
}) => {
  return (
    <div className={styles.loading} id="loading-screen">
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
      <p className={styles.subtitle}>Sprawdzanie autoryzacji...</p>
    </div>
  );
};

