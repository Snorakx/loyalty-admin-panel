import React from 'react';
import { Card } from '../Card/Card';
import styles from './StatCard.module.scss';

interface StatCardProps {
  id?: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  icon,
  trend,
  trendValue
}) => (
  <Card id={id} className={styles.statCard}>
    <div className={styles.icon}>
      {icon}
    </div>
    <div className={styles.content}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {trend && trendValue && (
          <span className={`${styles.trend} ${styles[trend]}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} {trendValue}
          </span>
        )}
      </div>
    </div>
  </Card>
);
