import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { DeleteTenantConfirmation } from '../components/ui/DeleteTenantConfirmation';
import { DeleteLocationConfirmation } from '../components/ui/DeleteLocationConfirmation';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { Loader } from '../components/ui/Loader';
import { Trash2, Settings, AlertTriangle, MapPin } from 'lucide-react';
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

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export const SettingsView: React.FC = () => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    tenantName: string;
  }>({ isOpen: false, tenantName: '' });
  
  const [deleteLocationConfirmation, setDeleteLocationConfirmation] = useState<{
    isOpen: boolean;
    locationName: string;
    locationCity: string;
    locationId: string;
  }>({ isOpen: false, locationName: '', locationCity: '', locationId: '' });
  
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
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

      const locationsData = await tenantService.getLocations(currentUser.tenant_id);
      
      setCurrentTenant(tenant);
      setLocations(locationsData);
      logger.success('Tenant and locations data loaded successfully', { 
        tenantId: tenant.id, 
        locationsCount: locationsData.length 
      });
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

  const handleDeleteLocationClick = (location: Location) => {
    setDeleteLocationConfirmation({
      isOpen: true,
      locationName: location.name,
      locationCity: location.city,
      locationId: location.id
    });
  };

  const handleDeleteLocationConfirm = () => {
    // Tutaj będzie logika wysyłania żądania usunięcia lokalizacji
    console.log('Delete location request sent', deleteLocationConfirmation.locationId);
  };

  const handleDeleteLocationCancel = () => {
    setDeleteLocationConfirmation({ 
      isOpen: false, 
      locationName: '', 
      locationCity: '', 
      locationId: '' 
    });
  };

  if (loading) {
    return (
      <div className={styles.settingsView}>
        <Loader 
          size="lg" 
          variant="pulse" 
          text="Ładowanie danych profilu firmy..." 
        />
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

        {locations.length > 0 && (
          <>
            <div className={styles.separator} />
            
            <Card className={styles.locationsCard}>
              <div className={styles.locationsHeader}>
                <h2>
                  <MapPin size={20} />
                  Lokalizacje ({locations.length})
                </h2>
              </div>
              
              <div className={styles.locationsList}>
                {locations.map((location) => (
                  <div key={location.id} className={styles.locationItem}>
                    <div className={styles.locationInfo}>
                      <h3 className={styles.locationName}>{location.name}</h3>
                      <p className={styles.locationAddress}>
                        {location.address}, {location.city}
                      </p>
                      {location.phone && (
                        <p className={styles.locationContact}>
                          📞 {location.phone}
                        </p>
                      )}
                    </div>
                    <div className={styles.locationActions}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteLocationClick(location)}
                      >
                        <Trash2 size={14} />
                        Usuń
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        <div className={styles.separator} />

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

      {deleteLocationConfirmation.isOpen && (
        <DeleteLocationConfirmation
          isOpen={deleteLocationConfirmation.isOpen}
          onClose={handleDeleteLocationCancel}
          onConfirm={handleDeleteLocationConfirm}
          locationName={deleteLocationConfirmation.locationName}
          locationCity={deleteLocationConfirmation.locationCity}
        />
      )}
    </div>
  );
};
