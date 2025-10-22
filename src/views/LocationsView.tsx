import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { AddLocationForm } from '../components/ui/AddLocationForm';
import { LocationsSkeleton } from '../components/LocationsSkeleton';
import { TenantService } from '../services/tenant.service';
import { AuthService } from '../services/auth.service';
import { MapPin, Plus, Edit, AlertTriangle } from 'lucide-react';
import { createLogger } from '../utils/logger';
import styles from './LocationsView.module.scss';

const logger = createLogger('LocationsView');

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export const LocationsView: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const tenantService = new TenantService();
  const authService = AuthService.getInstance();

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
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

      const locationsData = await tenantService.getLocations(currentUser.tenant_id);
      setLocations(locationsData);
      logger.success('Locations loaded successfully', { count: locationsData.length });
    } catch (error) {
      logger.error('Error loading locations', error);
      setError('Błąd podczas ładowania lokalizacji');
    } finally {
      // Minimum 1 second loading time for skeleton
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  const handleAddLocation = async (locationData: any) => {
    try {
      logger.info('Adding location:', locationData);
      const result = await tenantService.createLocation(locationData);
      
      if (result) {
        logger.success('Location added successfully');
        await loadLocations();
        setShowAddForm(false);
      } else {
        logger.error('Failed to add location');
        // TODO: Show error toast
      }
    } catch (error) {
      logger.error('Error adding location', error);
      // TODO: Show error toast
    }
  };

  const handleAddLocationCancel = () => {
    setShowAddForm(false);
  };

  const handleEditLocation = async (locationData: any) => {
    try {
      if (!editingLocation) {
        logger.error('No location selected for editing');
        return;
      }

      logger.info('Editing location:', { locationId: editingLocation.id, data: locationData });
      const result = await tenantService.updateLocation(editingLocation.id, locationData);
      
      if (result) {
        logger.success('Location updated successfully');
        await loadLocations();
        setEditingLocation(null);
      } else {
        logger.error('Failed to update location');
        // TODO: Show error toast
      }
    } catch (error) {
      logger.error('Error editing location', error);
      // TODO: Show error toast
    }
  };

  if (loading) {
    return <LocationsSkeleton />;
  }

  if (error) {
    return (
      <div className={styles.locationsView}>
        <div className={styles.error}>
          <AlertTriangle size={32} className={styles.errorIcon} />
          <h2>Błąd</h2>
          <p>{error}</p>
          <Button onClick={loadLocations}>
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.locationsView}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <MapPin size={24} />
          Lokalizacje
        </h1>
        <p className={styles.subtitle}>
          Zarządzaj lokalizacjami swojej firmy
        </p>
        <div className={styles.headerActions}>
          <Button
            variant="primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Dodaj lokalizację
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        {locations.length === 0 ? (
          <Card className={styles.emptyState}>
            <MapPin size={48} className={styles.emptyIcon} />
            <h2>Brak lokalizacji</h2>
            <p>Nie masz jeszcze żadnych lokalizacji. Dodaj pierwszą lokalizację, aby rozpocząć.</p>
            <Button 
              variant="primary"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={16} />
              Dodaj lokalizację
            </Button>
          </Card>
        ) : (
          <div className={styles.locationsGrid}>
            {locations.map((location) => (
              <Card key={location.id} className={styles.locationCard}>
                <div className={styles.locationHeader}>
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
                    {location.email && (
                      <p className={styles.locationContact}>
                        ✉️ {location.email}
                      </p>
                    )}
                  </div>
                  <div className={styles.locationActions}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingLocation(location)}
                    >
                      <Edit size={16} />
                    </Button>
                  </div>
                </div>
                <div className={styles.locationFooter}>
                  <span className={styles.locationDate}>
                    Dodano: {new Date(location.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <AddLocationForm
          isOpen={showAddForm}
          onClose={handleAddLocationCancel}
          onConfirm={handleAddLocation}
        />
      )}

      {editingLocation && (
        <AddLocationForm
          isOpen={!!editingLocation}
          onClose={() => setEditingLocation(null)}
          onConfirm={handleEditLocation}
          editingLocation={editingLocation}
        />
      )}
    </div>
  );
};
