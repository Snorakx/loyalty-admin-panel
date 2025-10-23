import React, { useState } from 'react';
import { Card } from '../ui/Card/Card';
import { Button } from '../ui/Button/Button';
import { Sparkles, Brain, Target, TrendingUp, Users, Calendar } from 'lucide-react';
import styles from './AICampaignPlanner.module.scss';

export const AICampaignPlanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={styles.aiCampaignPlanner}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <Sparkles size={24} className={styles.icon} />
          </div>
          <div className={styles.titleSection}>
            <h2 className={styles.title}>AI Campaign Planner</h2>
            <p className={styles.subtitle}>
              Planuj inteligentne kampanie marketingowe z pomocą sztucznej inteligencji
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.toggleButton}
        >
          {isExpanded ? 'Zwiń' : 'Rozwiń'}
        </Button>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.features}>
            <div className={styles.feature}>
              <Brain size={20} className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h3>Inteligentna analiza</h3>
                <p>AI analizuje Twoje dane i sugeruje najlepsze strategie</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <Target size={20} className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h3>Precyzyjne targetowanie</h3>
                <p>Znajdź idealnych klientów na podstawie zachowań i preferencji</p>
              </div>
            </div>
            
            <div className={styles.feature}>
              <TrendingUp size={20} className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h3>Optymalizacja ROI</h3>
                <p>Maksymalizuj zwrot z inwestycji dzięki inteligentnym rekomendacjom</p>
              </div>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <Users size={16} />
              <span>Analiza 10,000+ klientów</span>
            </div>
            <div className={styles.stat}>
              <Calendar size={16} />
              <span>Planowanie na 30 dni</span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" disabled className={styles.primaryAction}>
              <Sparkles size={16} />
              Rozpocznij planowanie (wkrótce)
            </Button>
            <Button variant="outline" disabled>
              Zobacz przykłady
            </Button>
          </div>

          <div className={styles.comingSoon}>
            <div className={styles.comingSoonBadge}>
              <Sparkles size={14} />
              Wkrótce dostępne
            </div>
            <p className={styles.comingSoonText}>
              Pracujemy nad zaawansowanymi funkcjami AI. Bądź na bieżąco!
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
