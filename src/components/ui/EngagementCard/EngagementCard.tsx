import React from 'react';
import { StatCard } from '../StatCard';
import { Drawer, useDrawer } from '../Drawer';
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
}) => {
  const { isOpen, open, close } = useDrawer();

  return (
    <>
      <div className={styles.engagementCard}>
        <StatCard
          id={id}
          title={title}
          value={value}
          icon={icon}
          trend={trend}
          trendValue={trendValue}
        />
        <button 
          className={styles.infoIcon}
          onClick={open}
          aria-label="Pokaż informacje o zaangażowaniu klientów"
        >
          <Info size={16} />
        </button>
      </div>

      <Drawer
        isOpen={isOpen}
        onClose={close}
        title="Zaangażowanie klientów"
      >
        <div className={styles.drawerContent}>
          <div className={styles.description}>
            <h3>Co to oznacza?</h3>
            <p>
              Zaangażowanie klientów to średnia liczba wizyt na aktywnego klienta. 
              Pokazuje jak często klienci wracają do Twojego biznesu.
            </p>
          </div>

          <div className={styles.examples}>
            <h3>Przykłady wartości:</h3>
            <div className={styles.exampleItem}>
              <span className={styles.value}>5.0</span>
              <span className={styles.explanation}>
                Klienci wracają średnio 5 razy - doskonałe zaangażowanie!
              </span>
            </div>
            <div className={styles.exampleItem}>
              <span className={styles.value}>2.5</span>
              <span className={styles.explanation}>
                Klienci wracają średnio 2-3 razy - dobre zaangażowanie
              </span>
            </div>
            <div className={styles.exampleItem}>
              <span className={styles.value}>1.0</span>
              <span className={styles.explanation}>
                Klienci wracają tylko raz - niskie zaangażowanie
              </span>
            </div>
          </div>

          <div className={styles.tips}>
            <h3>Jak poprawić zaangażowanie?</h3>
            <ul>
              <li>Oferuj atrakcyjne promocje dla stałych klientów</li>
              <li>Pamiętaj o urodzinach i rocznicach</li>
              <li>Zbieraj opinie i reaguj na sugestie</li>
              <li>Twórz programy lojalnościowe</li>
            </ul>
          </div>
        </div>
      </Drawer>
    </>
  );
};
