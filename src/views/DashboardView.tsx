import React, { useState, useEffect, useRef } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { Button } from '../components/ui/Button/Button';
import { Card } from '../components/ui/Card/Card';
import { TenantService } from '../services/tenant.service';
import { Download, Sparkles } from 'lucide-react';
import { createLogger } from '../utils/logger';
import styles from './DashboardView.module.scss';

const logger = createLogger('DashboardView');


export const DashboardView: React.FC = () => {
  logger.debug('DashboardView rendered');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalStamps: 0,
    activeCards: 0,
    engagement: 0,
    customersTrend: 0,
    stampsTrend: 0,
    cardsTrend: 0,
    engagementTrend: 0
  });

  const [tenantService] = useState(() => TenantService.getInstance());
  const hasLoadedData = useRef(false);

  useEffect(() => {
    if (hasLoadedData.current) {
      logger.debug('Data already loaded, skipping');
      return;
    }
    
    logger.info('useEffect called - loading data');
    hasLoadedData.current = true;
    loadData();
  }, []);

  const loadData = async () => {
    logger.info('loadData called');
    setLoading(true);
    try {
      // First ensure user is fetched and cached
      await tenantService.authService.fetchCurrentUser();
      
      logger.debug('Fetching dashboard stats...');
      const dashboardData = await tenantService.getDashboardData();
      logger.success('Dashboard stats fetched', { 
        stats: dashboardData.stats
      });

      setStats({
        totalCustomers: dashboardData.stats.totalCustomers || 0,
        totalStamps: dashboardData.stats.stampsToday || 0,
        activeCards: dashboardData.stats.activeCards || 0,
        engagement: dashboardData.stats.engagement || 0,
        customersTrend: dashboardData.stats.customersTrend || 0,
        stampsTrend: dashboardData.stats.stampsTrend || 0,
        cardsTrend: dashboardData.stats.cardsTrend || 0,
        engagementTrend: dashboardData.stats.engagementTrend || 0
      });
    } catch (error) {
      logger.error('Error loading dashboard data', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className={styles.dashboardView}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <div className={styles.headerActions}>
          <Button variant="outline" onClick={() => window.print()}>
            <Download size={16} />
            Eksportuj
          </Button>
        </div>
      </div>

      <DashboardStats 
        totalCustomers={stats.totalCustomers}
        totalStamps={stats.totalStamps}
        activeCards={stats.activeCards}
        engagement={stats.engagement}
        customersTrend={stats.customersTrend}
        stampsTrend={stats.stampsTrend}
        cardsTrend={stats.cardsTrend}
        engagementTrend={stats.engagementTrend}
      />

      <div className={styles.aiSection}>
        <Card className={styles.aiCard}>
          <div className={styles.aiHeader}>
            <div className={styles.aiIcon}>
              <Sparkles size={24} />
            </div>
            <div className={styles.aiContent}>
              <h2>AI Campaign Planner</h2>
              <p>Planuj inteligentne kampanie push z pomocą AI</p>
            </div>
          </div>
          <div className={styles.aiPlaceholder}>
            <p>🚀 Wkrótce: Planowanie kampanii push z AI</p>
            <p>Funkcjonalność będzie dostępna w następnej wersji</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
