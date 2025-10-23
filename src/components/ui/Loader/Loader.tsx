import React from 'react';
import styles from './Loader.module.scss';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  className = ''
}) => {
  const sizeClass = styles[`size-${size}`];
  const variantClass = styles[`variant-${variant}`];
  
  return (
    <div className={`${styles.loader} ${sizeClass} ${variantClass} ${className}`}>
      <div className={styles.loaderContent}>
        {variant === 'spinner' && (
          <div className={styles.spinner}>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
            <div className={styles.spinnerRing}></div>
          </div>
        )}
        
        {variant === 'dots' && (
          <div className={styles.dots}>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
            <div className={styles.dot}></div>
          </div>
        )}
        
        {variant === 'pulse' && (
          <div className={styles.pulse}>
            <div className={styles.pulseCircle}></div>
          </div>
        )}
        
        {variant === 'wave' && (
          <div className={styles.wave}>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
            <div className={styles.waveBar}></div>
          </div>
        )}
        
        {text && (
          <div className={styles.text}>
            {text}
          </div>
        )}
      </div>
    </div>
  );
};
