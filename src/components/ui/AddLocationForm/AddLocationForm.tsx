import React, { useState, useEffect } from 'react';
import { MapPin, Plus } from 'lucide-react';
import { Drawer } from '../Drawer';
import { Button } from '../Button/Button';
import { FormField } from '../FormField/FormField';
import styles from './AddLocationForm.module.scss';

interface AddLocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (locationData: LocationFormData) => void;
  editingLocation?: LocationFormData;
}

interface LocationFormData {
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
}

export const AddLocationForm: React.FC<AddLocationFormProps> = ({
  isOpen,
  onClose,
  onConfirm,
  editingLocation
}) => {
  const [formData, setFormData] = useState<LocationFormData>({
    name: '',
    address: '',
    city: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<LocationFormData>>({});

  // Update form data when editingLocation changes
  useEffect(() => {
    if (editingLocation) {
      setFormData(editingLocation);
    } else {
      setFormData({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: ''
      });
    }
  }, [editingLocation]);

  const validateForm = (): boolean => {
    const newErrors: Partial<LocationFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nazwa lokalizacji jest wymagana';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres jest wymagany';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Miasto jest wymagane';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{9,}$/.test(formData.phone)) {
      newErrors.phone = 'Nieprawidłowy format telefonu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LocationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onConfirm(formData);
    } catch (error) {
      console.error('Error adding location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      phone: '',
      email: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const isFormValid = formData.name?.trim() && formData.address?.trim() && formData.city?.trim();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={handleClose}
      title={editingLocation ? "Edytuj lokalizację" : "Dodaj nową lokalizację"}
    >
      <div className={styles.addLocationForm}>
        <div className={styles.formHeader}>
          <div className={styles.headerIcon}>
            <MapPin size={32} />
          </div>
          <h2>{editingLocation ? "Edytuj lokalizację" : "Nowa lokalizacja"}</h2>
          <p>
            {editingLocation 
              ? "Wprowadź zmiany w danych lokalizacji."
              : "Wypełnij poniższe pola, aby dodać nową lokalizację do swojej firmy."
            }
          </p>
        </div>

        <div className={styles.formFields}>
          <FormField
            label="Nazwa lokalizacji *"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            placeholder="np. Główna siedziba, Filia Warszawa"
            error={errors.name}
            disabled={isSubmitting}
          />

          <FormField
            label="Adres *"
            value={formData.address}
            onChange={(value) => handleInputChange('address', value)}
            placeholder="np. ul. Marszałkowska 1"
            error={errors.address}
            disabled={isSubmitting}
          />

          <FormField
            label="Miasto *"
            value={formData.city}
            onChange={(value) => handleInputChange('city', value)}
            placeholder="np. Warszawa"
            error={errors.city}
            disabled={isSubmitting}
          />

          <FormField
            label="Telefon"
            value={formData.phone || ''}
            onChange={(value) => handleInputChange('phone', value)}
            placeholder="np. +48 123 456 789"
            error={errors.phone}
            disabled={isSubmitting}
          />

          <FormField
            label="Email"
            value={formData.email || ''}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="np. kontakt@firma.pl"
            error={errors.email}
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formActions}>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            fullWidth
          >
            Anuluj
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
            fullWidth
          >
            <Plus size={16} />
            {isSubmitting 
              ? (editingLocation ? 'Zapisywanie...' : 'Dodawanie...') 
              : (editingLocation ? 'Zapisz zmiany' : 'Dodaj lokalizację')
            }
          </Button>
        </div>
      </div>
    </Drawer>
  );
};
