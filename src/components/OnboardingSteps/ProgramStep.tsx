import React from 'react';
import { Button } from '../ui/Button/Button';
import { FormField } from '../ui/FormField/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateNumber, validateLength } from '../../utils/validation';
import { OnboardingData } from '../../views/OnboardingView';
import { ChevronLeft, Check } from 'lucide-react';
import styles from './OnboardingSteps.module.scss';

interface ProgramStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
}

export const ProgramStep: React.FC<ProgramStepProps> = ({ 
  data, 
  updateData, 
  onComplete, 
  onBack,
  loading 
}) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateAll } = useFormValidation(
    {
      stampsRequired: data.stampsRequired.toString(),
      rewardDescription: data.rewardDescription
    },
    {
      stampsRequired: (value) => validateNumber(value, 3, 20, 'Liczba pieczątek'),
      rewardDescription: (value) => validateLength(value, 3, 200, 'Opis nagrody')
    }
  );

  const handleComplete = () => {
    console.log('ProgramStep handleComplete called');
    if (validateAll()) {
      console.log('Validation passed, calling updateData and onComplete');
      updateData({
        stampsRequired: parseInt(values.stampsRequired),
        rewardDescription: values.rewardDescription
      });
      onComplete();
    } else {
      console.log('Validation failed');
    }
  };

  return (
    <div className={styles.stepContent} id="program-step">
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Program lojalnościowy</h2>
        <p className={styles.stepDescription}>
          Skonfiguruj zasady swojego programu lojalnościowego
        </p>
      </div>

      <div className={styles.stepForm}>
        <div className={styles.formField}>
          <label htmlFor="stamps-required" className={styles.label}>
            Liczba pieczątek do nagrody <span className={styles.required}>*</span>
          </label>
          <input
            id="stamps-required"
            type="number"
            min="3"
            max="20"
            value={values.stampsRequired}
            onChange={(e) => {
              setFieldValue('stampsRequired', e.target.value);
              setFieldTouched('stampsRequired', true);
            }}
            className={styles.numberInput}
          />
          {touched.stampsRequired && errors.stampsRequired && (
            <span className={styles.errorMessage}>{errors.stampsRequired}</span>
          )}
          <span className={styles.helperText}>
            Od 3 do 20 pieczątek. Domyślnie: 10
          </span>
        </div>

        <FormField
          id="reward-description"
          label="Opis nagrody"
          value={values.rewardDescription}
          onChange={(value) => {
            setFieldValue('rewardDescription', value);
            setFieldTouched('rewardDescription', true);
          }}
          error={touched.rewardDescription ? errors.rewardDescription : null}
          required
          placeholder="np. 10-ta kawa za darmo"
          helperText="Krótki opis tego, co klient otrzyma po zebraniu wszystkich pieczątek"
        />

        <div className={styles.exampleBox}>
          <h4 className={styles.exampleTitle}>Przykłady nagród:</h4>
          <ul className={styles.exampleList}>
            <li>10-ta kawa za darmo</li>
            <li>Darmowe strzyżenie</li>
            <li>20% zniżki na następną wizytę</li>
            <li>Darmowy masaż relaksacyjny</li>
            <li>Gratis do następnego zamówienia</li>
          </ul>
        </div>

        <div className={styles.summaryBox}>
          <h4 className={styles.summaryTitle}>Podsumowanie:</h4>
          <div className={styles.summaryItem}>
            <strong>Biznes:</strong> {data.businessName || '-'}
          </div>
          <div className={styles.summaryItem}>
            <strong>Typ:</strong> {data.businessType || '-'}
          </div>
          <div className={styles.summaryItem}>
            <strong>Lokalizacja:</strong> {data.locationName || '-'}
          </div>
          <div className={styles.summaryItem}>
            <strong>Pieczątki:</strong> {values.stampsRequired || '-'}
          </div>
          <div className={styles.summaryItem}>
            <strong>Nagroda:</strong> {values.rewardDescription || '-'}
          </div>
        </div>
      </div>

      <div className={styles.stepActions}>
        <Button
          id="program-back-btn"
          variant="outline"
          onClick={onBack}
          disabled={loading}
        >
          <ChevronLeft size={16} /> Wstecz
        </Button>
        <Button
          id="program-complete-btn"
          onClick={handleComplete}
          disabled={loading}
        >
          {loading ? 'Zapisywanie...' : (
            <>
              <Check size={16} /> Zakończ konfigurację
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

