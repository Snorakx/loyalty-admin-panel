import React from 'react';
import { Skeleton } from './ui/Skeleton';
import { Card } from './ui/Card/Card';
import styles from './LocationsSkeleton.module.scss';

export const LocationsSkeleton: React.FC = () => {
  return (
    <div className={styles.locationsSkeleton}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <Skeleton width="200px" height="32px" />
          <Skeleton width="300px" height="20px" />
        </div>
        <Skeleton width="140px" height="40px" />
      </div>

      <div className={styles.content}>
        <div className={styles.locationsGrid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className={styles.locationCard}>
              <div className={styles.locationHeader}>
                <div className={styles.locationInfo}>
                  <Skeleton width="180px" height="24px" />
                  <Skeleton width="250px" height="16px" />
                  <Skeleton width="120px" height="16px" />
                </div>
                <div className={styles.locationActions}>
                  <Skeleton width="32px" height="32px" variant="circular" />
                </div>
              </div>
              <div className={styles.locationFooter}>
                <Skeleton width="150px" height="14px" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
