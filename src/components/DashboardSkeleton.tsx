import React from 'react';
import { Skeleton } from './ui/Skeleton';
import styles from './DashboardSkeleton.module.scss';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className={styles.dashboardSkeleton}>
      {/* Header skeleton */}
      <div className={styles.header}>
        <Skeleton width={200} height={32} />
        <Skeleton width={120} height={36} />
      </div>

      {/* Stats cards skeleton */}
      <div className={styles.statsGrid}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statHeader}>
              <Skeleton width={48} height={48} variant="rectangular" />
              <div className={styles.statContent}>
                <Skeleton width={120} height={16} />
                <Skeleton width={80} height={24} />
              </div>
            </div>
            <div className={styles.statFooter}>
              <Skeleton width={60} height={14} />
            </div>
          </div>
        ))}
      </div>

      {/* AI section skeleton */}
      <div className={styles.aiSection}>
        <div className={styles.aiCard}>
          <div className={styles.aiHeader}>
            <Skeleton width={60} height={60} variant="circular" />
            <div className={styles.aiContent}>
              <Skeleton width={200} height={24} />
              <Skeleton width={300} height={16} />
            </div>
          </div>
          <div className={styles.aiPlaceholder}>
            <Skeleton width={250} height={20} />
            <Skeleton width={180} height={16} />
          </div>
        </div>
      </div>
    </div>
  );
};
