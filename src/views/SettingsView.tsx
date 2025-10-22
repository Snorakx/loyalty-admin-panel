import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { DeleteTenantConfirmation } from '../components/ui/DeleteTenantConfirmation';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { Trash2, Settings, AlertTriangle, Loader } from 'lucide-react';
import { createLogger } from '../utils/logger';
import styles from './SettingsView.module.scss';

const logger = createLogger('SettingsView');

interface Tenant {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
  stamp_icon_url?: string;
  created_at: string;
}

export const SettingsView: React.FC = () => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    tenantName: string;
  }>({ isOpen: false, tenantName: '' });
  
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tenantService = new TenantService();
  const authService = AuthService.getInstance();

  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        setError('Nie jesteś zalogowany');
        return;
      }

      if (!currentUser.tenant_id) {
        setError('Nie masz przypisanego profilu firmy');
        return;
      }

      const tenant = await tenantService.getTenant(currentUser.tenant_id);
      if (!tenant) {
        setError('Nie można załadować danych profilu firmy');
        return;
      }

      setCurrentTenant(tenant);
      logger.success('Tenant data loaded successfully', { tenantId: tenant.id });
    } catch (error) {
      logger.error('Error loading tenant data', error);
      setError('Błąd podczas ładowania danych profilu firmy');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!currentTenant) return;
    setDeleteConfirmation({ 
      isOpen: true, 
      tenantName: currentTenant.name 
    });
  };

  const handleDeleteConfirm = async () => {
    // Tutaj będzie logika wysyłania żądania usunięcia
    console.log('Wysyłanie żądania usunięcia profilu firmy:', currentTenant.name);
    // Po wysłaniu żądania drawer pozostaje otwarty
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, tenantName: '' });
  };

  if (loading) {
    return (
      <div className={styles.settingsView}>
        <div className={styles.loading}>
          <Loader size={32} className={styles.spinner} />
          <p>Ładowanie danych profilu firmy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.settingsView}>
        <div className={styles.error}>
          <AlertTriangle size={32} className={styles.errorIcon} />
          <h2>Błąd</h2>
          <p>{error}</p>
          <Button onClick={loadTenantData}>
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className={styles.settingsView}>
        <div className={styles.error}>
          <AlertTriangle size={32} className={styles.errorIcon} />
          <h2>Brak danych</h2>
          <p>Nie można załadować danych profilu firmy</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingsView}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Settings size={24} />
          Ustawienia
        </h1>
        <p className={styles.subtitle}>
          Zarządzaj ustawieniami swojego profilu firmy
        </p>
      </div>

      <div className={styles.content}>
        <Card className={styles.profileCard}>
          <h2>Profil firmy</h2>
          <div className={styles.profileInfo}>
            <div className={styles.infoItem}>
              <label>Nazwa firmy:</label>
              <span>{currentTenant.name}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Typ biznesu:</label>
              <span>{currentTenant.business_type}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Data utworzenia:</label>
              <span>{new Date(currentTenant.created_at).toLocaleDateString('pl-PL')}</span>
            </div>
          </div>
        </Card>

        <Card className={styles.dangerCard}>
          <div className={styles.dangerHeader}>
            <AlertTriangle size={24} className={styles.dangerIcon} />
            <h2>Strefa niebezpieczna</h2>
          </div>
          <p>
            Te operacje są nieodwracalne i wymagają zatwierdzenia przez administratora.
          </p>
          
          <div className={styles.dangerActions}>
            <Button
              variant="danger"
              onClick={handleDeleteClick}
            >
              <Trash2 size={16} />
              Usuń profil firmy
            </Button>
          </div>
        </Card>
      </div>

      {deleteConfirmation.isOpen && (
        <DeleteTenantConfirmation
          isOpen={deleteConfirmation.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          tenantName={deleteConfirmation.tenantName}
        />
      )}
    </div>
  );
};
