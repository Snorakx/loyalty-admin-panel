import React from 'react';
import { Skeleton } from './ui/Skeleton';
import { Card } from './ui/Card/Card';
import { Button } from './ui/Button/Button';
import { ArrowLeft } from 'lucide-react';
import styles from './PendingBusinessesSkeleton.module.scss';

export const PendingBusinessesSkeleton: React.FC = () => {
  return (
    <div className={styles.pendingBusinessesSkeleton}>
      <div className={styles.header}>
        <Button variant="outline" disabled>
          <ArrowLeft size={16} /> Powrót do dashboardu
        </Button>
      </div>

      <Card className={styles.content}>
        <div className={styles.cardHeader}>
          <div>
            <Skeleton width="200px" height="32px" />
            <Skeleton width="250px" height="20px" />
          </div>
          <div className={styles.badge}>
            <Skeleton width="24px" height="24px" variant="circular" />
            <Skeleton width="20px" height="16px" />
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <Skeleton width="120px" height="20px" />
            <Skeleton width="80px" height="20px" />
            <Skeleton width="100px" height="20px" />
            <Skeleton width="140px" height="20px" />
            <Skeleton width="80px" height="20px" />
          </div>
          
          <div className={styles.tableBody}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={styles.tableRow}>
                <Skeleton width="150px" height="16px" />
                <Skeleton width="100px" height="16px" />
                <Skeleton width="120px" height="16px" />
                <Skeleton width="100px" height="16px" />
                <Skeleton width="60px" height="32px" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
