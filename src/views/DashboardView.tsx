import React, { useEffect } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { AICampaignPlanner } from '../components/AICampaignPlanner';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button/Button';
import { TenantService } from '../services/tenant.service';
import { useAppState } from '../contexts/AppStateContext';
import { Download } from 'lucide-react';
import { createLogger } from '../utils/logger';
import styles from './DashboardView.module.scss';

const logger = createLogger('DashboardView');

export const DashboardView: React.FC = () => {
  logger.debug('DashboardView rendered');
  const { state, dispatch } = useAppState();
  const [tenantService] = React.useState(() => TenantService.getInstance());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Check if we have cached data
    if (state.dashboardStats) {
      logger.debug('Using cached dashboard stats');
      return;
    }

    logger.info('Loading dashboard data...');
    dispatch({ type: 'SET_LOADING', payload: { key: 'dashboard', value: true } });
    
    try {
      // First ensure user is fetched and cached
      await tenantService.authService.fetchCurrentUser();
      
      logger.debug('Fetching dashboard stats...');
      const dashboardData = await tenantService.getDashboardData();
      logger.success('Dashboard stats fetched', { 
        stats: dashboardData.stats
      });

      const stats = {
        totalCustomers: dashboardData.stats.totalCustomers || 0,
        totalStamps: dashboardData.stats.stampsToday || 0,
        activeCards: dashboardData.stats.activeCards || 0,
        engagement: dashboardData.stats.engagement || 0,
        customersTrend: dashboardData.stats.customersTrend || 0,
        stampsTrend: dashboardData.stats.stampsTrend || 0,
        cardsTrend: dashboardData.stats.cardsTrend || 0,
        engagementTrend: dashboardData.stats.engagementTrend || 0
      };

      dispatch({ type: 'SET_DASHBOARD_STATS', payload: stats });
      dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: 'dashboard', value: Date.now() } });
    } catch (error) {
      logger.error('Error loading dashboard data', error);
      dispatch({ type: 'SET_ERROR', payload: { key: 'dashboard', value: 'Błąd podczas ładowania danych dashboard' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'dashboard', value: false } });
    }
  };

  if (state.loading.dashboard) {
    return (
      <div className={styles.dashboardView}>
        <Loader 
          size="lg" 
          variant="wave" 
          text="Ładowanie dashboard..." 
        />
      </div>
    );
  }

  if (state.errors.dashboard) {
    return (
      <div className={styles.dashboardView}>
        <div className={styles.error}>
          <p>{state.errors.dashboard}</p>
          <Button onClick={loadData}>Spróbuj ponownie</Button>
        </div>
      </div>
    );
  }

  const stats = state.dashboardStats || {
    totalCustomers: 0,
    totalStamps: 0,
    activeCards: 0,
    engagement: 0,
    customersTrend: 0,
    stampsTrend: 0,
    cardsTrend: 0,
    engagementTrend: 0
  };

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

      <div className={styles.content}>
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

        <AICampaignPlanner />
      </div>
    </div>
  );
};