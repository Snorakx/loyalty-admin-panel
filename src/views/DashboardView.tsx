import React, { useState, useEffect, useRef } from 'react';
import { DashboardStats } from '../components/DashboardStats';
import { LocationList } from '../components/LocationList';
import { TenantList } from '../components/TenantList';
import { Button } from '../components/ui/Button/Button';
import { Card } from '../components/ui/Card/Card';
import { TenantService } from '../services/tenant.service';
import { QrCode, Download, Building2, MapPin } from 'lucide-react';
import { createLogger } from '../utils/logger';
import styles from './DashboardView.module.scss';

const logger = createLogger('DashboardView');

interface Location {
  id: string;
  name: string;
  address: string;
  scan_code: string;
  created_at: string;
}

interface Tenant {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
  stamp_icon_url?: string;
  created_at: string;
}

export const DashboardView: React.FC = () => {
  logger.debug('DashboardView rendered');
  const [locations, setLocations] = useState<Location[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tenants' | 'locations'>('tenants');
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
      
      logger.debug('Fetching dashboard data...');
      const dashboardData = await tenantService.getDashboardData();
      logger.success('Dashboard data fetched', { 
        tenantsCount: dashboardData.tenants.length,
        locationsCount: dashboardData.locations.length,
        stats: dashboardData.stats
      });

      setTenants(dashboardData.tenants);
      setLocations(dashboardData.locations);
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

  const handleAddLocation = (name: string, address: string) => {
    const newLocation: Location = {
      id: Date.now().toString(),
      name,
      address,
      scan_code: generateScanCode(),
      created_at: new Date().toISOString()
    };
    setLocations(prev => [...prev, newLocation]);
  };

  const handleEditLocation = (id: string, name: string, address: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === id ? { ...loc, name, address } : loc
    ));
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(prev => prev.filter(loc => loc.id !== id));
  };

  const handleAddTenant = (name: string, businessType: string) => {
    const newTenant: Tenant = {
      id: `tenant-${Date.now()}`,
      name,
      business_type: businessType,
      created_at: new Date().toISOString()
    };
    setTenants(prev => [...prev, newTenant]);
  };

  const handleEditTenant = (id: string, name: string, businessType: string) => {
    setTenants(prev => prev.map(tenant => 
      tenant.id === id ? { ...tenant, name, business_type: businessType } : tenant
    ));
  };

  const handleDeleteTenant = (id: string) => {
    setTenants(prev => prev.filter(tenant => tenant.id !== id));
  };

  const handleGenerateQR = (scanCode: string) => {
    setQrCode(scanCode);
  };

  const generateScanCode = () => {
    return Math.random().toString(36).substring(2, 15) + '-' + 
           Math.random().toString(36).substring(2, 15);
  };

  const handleDownloadQR = () => {
    // TODO: Implement QR code download
    logger.debug('Download QR code', { qrCode });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Ładowanie dashboard...</p>
      </div>
    );
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

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'tenants' ? styles.active : ''}`}
          onClick={() => setActiveTab('tenants')}
        >
          <Building2 size={16} />
          Tenanty
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'locations' ? styles.active : ''}`}
          onClick={() => setActiveTab('locations')}
        >
          <MapPin size={16} />
          Lokalizacje
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'tenants' && (
          <TenantList
            tenants={tenants}
            onAddTenant={handleAddTenant}
            onEditTenant={handleEditTenant}
            onDeleteTenant={handleDeleteTenant}
          />
        )}
        
        {activeTab === 'locations' && (
          <div className={styles.leftColumn}>
            <LocationList
              locations={locations}
              onAddLocation={handleAddLocation}
              onEditLocation={handleEditLocation}
              onDeleteLocation={handleDeleteLocation}
              onGenerateQR={handleGenerateQR}
            />
          </div>
        )}

        <div className={styles.rightColumn}>
          {qrCode && (
            <Card className={styles.qrCard}>
              <h3>Kod QR do skanowania</h3>
              <div className={styles.qrCode}>
                <div className={styles.qrPlaceholder}>
                  <QrCode size={120} />
                  <p>QR Code: {qrCode}</p>
                </div>
              </div>
              <Button fullWidth onClick={handleDownloadQR}>
                Pobierz QR Code
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
