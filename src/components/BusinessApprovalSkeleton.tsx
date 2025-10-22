import React from 'react';
import { Skeleton } from './ui/Skeleton';
import { Card } from './ui/Card/Card';
import { Button } from './ui/Button/Button';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import styles from './BusinessApprovalSkeleton.module.scss';

export const BusinessApprovalSkeleton: React.FC = () => {
  return (
    <div className={styles.businessApprovalSkeleton}>
      <div className={styles.header}>
        <Button variant="outline" disabled>
          <ArrowLeft size={16} /> Powrót do listy
        </Button>
      </div>

      <div className={styles.content}>
        <Card className={styles.businessCard}>
          <div className={styles.businessHeader}>
            <div className={styles.businessInfo}>
              <Skeleton width="200px" height="32px" />
              <Skeleton width="150px" height="20px" />
              <Skeleton width="100px" height="16px" />
            </div>
            <div className={styles.businessScore}>
              <Skeleton width="60px" height="24px" />
            </div>
          </div>
        </Card>

        <Card className={styles.detailsCard}>
          <div className={styles.cardHeader}>
            <Skeleton width="150px" height="24px" />
          </div>
          
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
            <div className={styles.detailItem}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
            <div className={styles.detailItem}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
            <div className={styles.detailItem}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
          </div>
        </Card>

        <Card className={styles.actions}>
          <div className={styles.actionButtons}>
            <Button variant="primary" disabled>
              <CheckCircle size={16} /> Zatwierdź biznes
            </Button>
            <Button variant="outline" disabled>
              <AlertCircle size={16} /> Poproś o zmiany
            </Button>
            <Button variant="danger" disabled>
              <XCircle size={16} /> Odrzuć aplikację
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
