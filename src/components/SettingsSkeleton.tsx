import React from 'react';
import { Skeleton } from './ui/Skeleton';
import { Card } from './ui/Card/Card';
import { Button } from './ui/Button/Button';
import { Trash2, MapPin } from 'lucide-react';
import styles from './SettingsSkeleton.module.scss';

export const SettingsSkeleton: React.FC = () => {
  return (
    <div className={styles.settingsSkeleton}>
      <div className={styles.header}>
        <Skeleton width="200px" height="32px" />
      </div>

      <div className={styles.settingsContent}>
        <Card className={styles.profileCard}>
          <div className={styles.cardHeader}>
            <Skeleton width="180px" height="24px" />
          </div>
          
          <div className={styles.profileInfo}>
            <div className={styles.infoRow}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
            <div className={styles.infoRow}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
            <div className={styles.infoRow}>
              <Skeleton width="100px" height="16px" />
              <Skeleton width="200px" height="16px" />
            </div>
          </div>
        </Card>

        <div className={styles.separator} />

        <Card className={styles.locationsCard}>
          <div className={styles.locationsHeader}>
            <div className={styles.headerContent}>
              <MapPin size={20} />
              <Skeleton width="120px" height="20px" />
            </div>
          </div>
          
          <div className={styles.locationsList}>
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className={styles.locationItem}>
                <div className={styles.locationInfo}>
                  <Skeleton width="150px" height="18px" />
                  <Skeleton width="200px" height="14px" />
                  <Skeleton width="120px" height="14px" />
                </div>
                <div className={styles.locationActions}>
                  <Button variant="danger" size="sm" disabled>
                    <Trash2 size={14} />
                    Usuń
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className={styles.separator} />

        <Card className={styles.dangerCard}>
          <div className={styles.dangerHeader}>
            <div className={styles.dangerIcon}>
              <Trash2 size={24} />
            </div>
            <Skeleton width="200px" height="24px" />
          </div>
          
          <Skeleton width="300px" height="16px" />
          
          <div className={styles.dangerActions}>
            <Button variant="danger" disabled>
              <Trash2 size={16} />
              Usuń profil firmy
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
