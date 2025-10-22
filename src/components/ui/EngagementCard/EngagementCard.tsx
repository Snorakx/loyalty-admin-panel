import React from 'react';
import { StatCard } from '../StatCard';
import { Tooltip } from '../Tooltip';
import { Info } from 'lucide-react';
import styles from './EngagementCard.module.scss';

interface EngagementCardProps {
  id: string;
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const EngagementCard: React.FC<EngagementCardProps> = ({
  id,
  title,
  value,
  icon,
  trend,
  trendValue
}) => (
  <div className={styles.engagementCard}>
    <StatCard
      id={id}
      title={title}
      value={value}
      icon={icon}
      trend={trend}
      trendValue={trendValue}
    />
    <div className={styles.infoIcon}>
      <Tooltip
        content={
          <>
            <strong>Zaangażowanie klientów</strong>
            <p>Średnia liczba wizyt na aktywnego klienta</p>
            <div className={styles.examples}>
              <div>• 5.0 = klienci wracają średnio 5 razy</div>
              <div>• 2.5 = klienci wracają średnio 2-3 razy</div>
              <div>• 1.0 = klienci wracają tylko raz</div>
            </div>
          </>
        }
        position="auto"
      >
        <Info size={16} />
      </Tooltip>
    </div>
  </div>
);
