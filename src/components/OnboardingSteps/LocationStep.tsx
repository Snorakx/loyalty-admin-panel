import React from 'react';
import { Button } from '../ui/Button/Button';
import { FormField } from '../ui/FormField/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateLength } from '../../utils/validation';
import { OnboardingData } from '../../views/OnboardingView';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './OnboardingSteps.module.scss';

interface LocationStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({ data, updateData, onNext, onBack }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateAll } = useFormValidation(
    {
      locationName: data.locationName,
      locationAddress: data.locationAddress
    },
    {
      locationName: (value) => validateLength(value, 2, 100, 'Nazwa lokalizacji'),
      locationAddress: (value) => validateLength(value, 5, 500, 'Adres')
    }
  );

  const handleNext = () => {
    if (validateAll()) {
      updateData({
        locationName: values.locationName,
        locationAddress: values.locationAddress
      });
      onNext();
    }
  };

  return (
    <div className={styles.stepContent} id="location-step">
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Pierwsza lokalizacja</h2>
        <p className={styles.stepDescription}>
          Dodaj swoją pierwszą lokalizację. Więcej lokalizacji możesz dodać później.
        </p>
      </div>

      <div className={styles.stepForm}>
        <FormField
          id="location-name"
          label="Nazwa lokalizacji"
          value={values.locationName}
          onChange={(value) => {
            setFieldValue('locationName', value);
            setFieldTouched('locationName', true);
          }}
          error={touched.locationName ? errors.locationName : null}
          required
          placeholder="np. Coderno Coffee Centrum"
          helperText="Nazwa, która pomoże odróżnić tę lokalizację od innych"
        />

        <div className={styles.formField}>
          <label htmlFor="location-address" className={styles.label}>
            Pełny adres <span className={styles.required}>*</span>
          </label>
          <textarea
            id="location-address"
            value={values.locationAddress}
            onChange={(e) => {
              setFieldValue('locationAddress', e.target.value);
              setFieldTouched('locationAddress', true);
            }}
            className={styles.textarea}
            placeholder="ul. Nowy Świat 15&#10;00-001 Warszawa"
            rows={4}
          />
          {touched.locationAddress && errors.locationAddress && (
            <span className={styles.errorMessage}>{errors.locationAddress}</span>
          )}
          <span className={styles.helperText}>
            Podaj pełny adres z ulicą, numerem, kodem pocztowym i miastem
          </span>
        </div>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            <strong>Kod skanowania</strong> zostanie wygenerowany automatycznie po zapisaniu lokalizacji.
            Będziesz mógł go wydrukować i umieścić w lokalu.
          </p>
        </div>
      </div>

      <div className={styles.stepActions}>
        <Button
          id="location-back-btn"
          variant="outline"
          onClick={onBack}
        >
          <ChevronLeft size={16} /> Wstecz
        </Button>
        <Button
          id="location-next-btn"
          onClick={handleNext}
        >
          Dalej <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};

