import React from 'react';
import { Button } from '../ui/Button/Button';
import { FormField } from '../ui/FormField/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateEmail, validatePhone, validateRequired, validateLength } from '../../utils/validation';
import { OnboardingData } from '../../views/OnboardingView';
import { ChevronRight } from 'lucide-react';
import styles from './OnboardingSteps.module.scss';

interface BasicInfoStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
}

const BUSINESS_TYPES = [
  { value: 'cafe', label: 'Kawiarnia' },
  { value: 'restaurant', label: 'Restauracja' },
  { value: 'barbershop', label: 'Barber Shop' },
  { value: 'salon', label: 'Salon fryzjerski' },
  { value: 'spa', label: 'Spa' },
  { value: 'beauty', label: 'Salon kosmetyczny' },
  { value: 'gym', label: 'Siłownia' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'other', label: 'Inne' }
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, updateData, onNext }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateAll } = useFormValidation(
    {
      businessName: data.businessName,
      businessType: data.businessType,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone
    },
    {
      businessName: (value) => validateLength(value, 2, 100, 'Nazwa biznesu'),
      businessType: (value) => validateRequired(value, 'Typ biznesu'),
      contactPerson: (value) => validateLength(value, 2, 100, 'Imię i nazwisko'),
      contactEmail: validateEmail,
      contactPhone: validatePhone
    }
  );

  const handleNext = () => {
    if (validateAll()) {
      updateData({
        businessName: values.businessName,
        businessType: values.businessType,
        contactPerson: values.contactPerson,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone
      });
      onNext();
    }
  };

  return (
    <div className={styles.stepContent} id="basic-info-step">
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Informacje o biznesie</h2>
        <p className={styles.stepDescription}>
          Podaj podstawowe informacje o swoim biznesie
        </p>
      </div>

      <div className={styles.stepForm}>
        <FormField
          id="business-name"
          label="Nazwa biznesu"
          value={values.businessName}
          onChange={(value) => {
            setFieldValue('businessName', value);
            setFieldTouched('businessName', true);
          }}
          error={touched.businessName ? errors.businessName : null}
          required
          placeholder="np. Coderno Coffee"
        />

        <div className={styles.formField}>
          <label htmlFor="business-type" className={styles.label}>
            Typ biznesu <span className={styles.required}>*</span>
          </label>
          <select
            id="business-type"
            value={values.businessType}
            onChange={(e) => {
              setFieldValue('businessType', e.target.value);
              setFieldTouched('businessType', true);
            }}
            className={styles.select}
          >
            <option value="">Wybierz typ biznesu</option>
            {BUSINESS_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {touched.businessType && errors.businessType && (
            <span className={styles.errorMessage}>{errors.businessType}</span>
          )}
        </div>

        <FormField
          id="contact-person"
          label="Osoba kontaktowa"
          value={values.contactPerson}
          onChange={(value) => {
            setFieldValue('contactPerson', value);
            setFieldTouched('contactPerson', true);
          }}
          error={touched.contactPerson ? errors.contactPerson : null}
          required
          placeholder="Imię i nazwisko"
        />

        <FormField
          id="contact-email"
          label="Email kontaktowy"
          type="email"
          value={values.contactEmail}
          onChange={(value) => {
            setFieldValue('contactEmail', value);
            setFieldTouched('contactEmail', true);
          }}
          error={touched.contactEmail ? errors.contactEmail : null}
          required
          placeholder="kontakt@twojbiznes.pl"
        />

        <FormField
          id="contact-phone"
          label="Telefon kontaktowy"
          type="tel"
          value={values.contactPhone}
          onChange={(value) => {
            setFieldValue('contactPhone', value);
            setFieldTouched('contactPhone', true);
          }}
          error={touched.contactPhone ? errors.contactPhone : null}
          required
          placeholder="+48 123 456 789"
          helperText="Format: +48 XXX XXX XXX"
        />
      </div>

      <div className={styles.stepActions}>
        <Button
          id="basic-info-next-btn"
          onClick={handleNext}
        >
          Dalej <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

