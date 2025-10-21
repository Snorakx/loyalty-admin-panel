import React from 'react';
import { Card } from './ui/Card/Card';
import { Users, MapPin, CreditCard, TrendingUp } from 'lucide-react';
import styles from './DashboardStats.module.scss';

interface StatCardProps {
  id?: string;
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({
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

interface DashboardStatsProps {
  totalCustomers: number;
  totalStamps: number;
  activeCards: number;
  revenue: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCustomers,
  totalStamps,
  activeCards,
  revenue
}) => {
  return (
    <div className={styles.dashboardStats}>
      <StatCard
        id="stat-customers"
        title="Klienci"
        value={totalCustomers}
        icon={<Users size={24} />}
        trend="up"
        trendValue="+12%"
      />
      <StatCard
        id="stat-stamps"
        title="Stemple dzisiaj"
        value={totalStamps}
        icon={<MapPin size={24} />}
        trend="up"
        trendValue="+8%"
      />
      <StatCard
        id="stat-cards"
        title="Aktywne karty"
        value={activeCards}
        icon={<CreditCard size={24} />}
        trend="neutral"
        trendValue="0%"
      />
      <StatCard
        id="stat-revenue"
        title="Przychód"
        value={`${revenue} zł`}
        icon={<TrendingUp size={24} />}
        trend="up"
        trendValue="+15%"
      />
    </div>
  );
};
