import React from 'react';
import { StatCard } from './ui/StatCard';
import { EngagementCard } from './ui/EngagementCard';
import { Users, MapPin, CreditCard, TrendingUp } from 'lucide-react';
import styles from './DashboardStats.module.scss';


interface DashboardStatsProps {
  totalCustomers: number;
  totalStamps: number;
  activeCards: number;
  engagement: number;
  customersTrend: number;
  stampsTrend: number;
  cardsTrend: number;
  engagementTrend: number;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalCustomers,
  totalStamps,
  activeCards,
  engagement,
  customersTrend,
  stampsTrend,
  cardsTrend,
  engagementTrend
}) => {
  const formatTrend = (trend: number) => {
    if (trend > 0) return { trend: 'up' as const, trendValue: `+${trend}%` };
    if (trend < 0) return { trend: 'down' as const, trendValue: `${trend}%` };
    return { trend: 'neutral' as const, trendValue: '0%' };
  };

  const customersTrendData = formatTrend(customersTrend);
  const stampsTrendData = formatTrend(stampsTrend);
  const cardsTrendData = formatTrend(cardsTrend);
  const engagementTrendData = formatTrend(engagementTrend);

  return (
    <div className={styles.dashboardStats}>
      <StatCard
        id="stat-customers"
        title="Klienci"
        value={totalCustomers}
        icon={<Users size={24} />}
        trend={customersTrendData.trend}
        trendValue={customersTrendData.trendValue}
      />
      <StatCard
        id="stat-stamps"
        title="Stemple dzisiaj"
        value={totalStamps}
        icon={<MapPin size={24} />}
        trend={stampsTrendData.trend}
        trendValue={stampsTrendData.trendValue}
      />
      <StatCard
        id="stat-cards"
        title="Aktywne karty"
        value={activeCards}
        icon={<CreditCard size={24} />}
        trend={cardsTrendData.trend}
        trendValue={cardsTrendData.trendValue}
      />
      <EngagementCard
        id="stat-engagement"
        title="Zaangażowanie klientów"
        value={engagement}
        icon={<TrendingUp size={24} />}
        trend={engagementTrendData.trend}
        trendValue={engagementTrendData.trendValue}
      />
    </div>
  );
};
