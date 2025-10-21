import React, { useState } from 'react';
import { Card } from './ui/Card/Card';
import { Button } from './ui/Button/Button';
import { Input } from './ui/Input/Input';
import { MapPin, QrCode, Edit, Trash2 } from 'lucide-react';
import styles from './LocationList.module.scss';

interface Location {
  id: string;
  name: string;
  address: string;
  scan_code: string;
  created_at: string;
}

interface LocationListProps {
  locations: Location[];
  onAddLocation: (name: string, address: string) => void;
  onEditLocation: (id: string, name: string, address: string) => void;
  onDeleteLocation: (id: string) => void;
  onGenerateQR: (scanCode: string) => void;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onAddLocation,
  onEditLocation,
  onDeleteLocation,
  onGenerateQR
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onEditLocation(editingId, formData.name, formData.address);
      setEditingId(null);
    } else {
      onAddLocation(formData.name, formData.address);
    }
    setFormData({ name: '', address: '' });
    setShowAddForm(false);
  };

  const handleEdit = (location: Location) => {
    setEditingId(location.id);
    setFormData({ name: location.name, address: location.address });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: '', address: '' });
  };

  return (
    <div className={styles.locationList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Lokalizacje</h2>
        <Button
          id="add-location-btn"
          onClick={() => setShowAddForm(true)}
        >
          Dodaj lokalizację
        </Button>
      </div>

      {showAddForm && (
        <Card className={styles.formCard}>
          <h3>{editingId ? 'Edytuj lokalizację' : 'Dodaj lokalizację'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              id="location-name"
              placeholder="Nazwa lokalizacji"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
            <Input
              id="location-address"
              placeholder="Adres"
              value={formData.address}
              onChange={(value) => setFormData(prev => ({ ...prev, address: value }))}
            />
            <div className={styles.formActions}>
              <Button type="submit" disabled={!formData.name || !formData.address}>
                {editingId ? 'Zapisz' : 'Dodaj'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Anuluj
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className={styles.locations}>
        {locations.map((location) => (
          <Card key={location.id} id={`location-${location.id}`} className={styles.locationCard}>
            <div className={styles.locationHeader}>
              <div className={styles.locationInfo}>
                <MapPin size={20} />
                <div>
                  <h4 className={styles.locationName}>{location.name}</h4>
                  <p className={styles.locationAddress}>{location.address}</p>
                </div>
              </div>
              <div className={styles.locationActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onGenerateQR(location.scan_code)}
                >
                  <QrCode size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(location)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDeleteLocation(location.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
            <div className={styles.scanCode}>
              <span className={styles.scanCodeLabel}>Kod skanowania:</span>
              <code className={styles.scanCodeValue}>{location.scan_code}</code>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
