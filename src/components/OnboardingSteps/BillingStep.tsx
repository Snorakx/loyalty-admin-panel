import React from 'react';
import { Button } from '../ui/Button/Button';
import { FormField } from '../ui/FormField/FormField';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validateNIP, validatePostalCode, validateLength } from '../../utils/validation';
import { OnboardingData } from '../../views/OnboardingView';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import styles from './OnboardingSteps.module.scss';

interface BillingStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const BillingStep: React.FC<BillingStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onBack, 
  onSkip 
}) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, validateAll } = useFormValidation(
    {
      companyName: data.companyName || '',
      nip: data.nip || '',
      streetAddress: data.streetAddress || '',
      city: data.city || '',
      postalCode: data.postalCode || ''
    },
    {
      companyName: (value) => {
        if (!value) return { valid: true, error: null };
        return validateLength(value, 2, 200, 'Nazwa firmy');
      },
      nip: (value) => {
        if (!value) return { valid: true, error: null };
        return validateNIP(value);
      },
      streetAddress: (value) => {
        if (!value) return { valid: true, error: null };
        return validateLength(value, 3, 200, 'Ulica i numer');
      },
      city: (value) => {
        if (!value) return { valid: true, error: null };
        return validateLength(value, 2, 100, 'Miasto');
      },
      postalCode: (value) => {
        if (!value) return { valid: true, error: null };
        return validatePostalCode(value);
      }
    }
  );

  const hasAnyValue = values.companyName || values.nip || values.streetAddress || values.city || values.postalCode;

  const handleNext = () => {
    // If no values entered, skip
    if (!hasAnyValue) {
      onSkip();
      return;
    }

    // If values entered, validate all
    if (validateAll()) {
      updateData({
        companyName: values.companyName || undefined,
        nip: values.nip || undefined,
        streetAddress: values.streetAddress || undefined,
        city: values.city || undefined,
        postalCode: values.postalCode || undefined
      });
      onNext();
    }
  };

  return (
    <div className={styles.stepContent} id="billing-step">
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Dane do faktury</h2>
        <p className={styles.stepDescription}>
          Opcjonalnie możesz podać dane do faktur. Możesz to zrobić również później.
        </p>
      </div>

      <div className={styles.stepForm}>
        <FormField
          id="company-name"
          label="Nazwa firmy"
          value={values.companyName}
          onChange={(value) => {
            setFieldValue('companyName', value);
            setFieldTouched('companyName', true);
          }}
          error={touched.companyName ? errors.companyName : null}
          placeholder="np. Coderno Coffee Sp. z o.o."
        />

        <FormField
          id="nip"
          label="NIP"
          value={values.nip}
          onChange={(value) => {
            setFieldValue('nip', value);
            setFieldTouched('nip', true);
          }}
          error={touched.nip ? errors.nip : null}
          placeholder="XXX-XXX-XX-XX lub XXXXXXXXXX"
          helperText="10 cyfr, opcjonalnie z myślnikami"
        />

        <FormField
          id="street-address"
          label="Ulica i numer"
          value={values.streetAddress}
          onChange={(value) => {
            setFieldValue('streetAddress', value);
            setFieldTouched('streetAddress', true);
          }}
          error={touched.streetAddress ? errors.streetAddress : null}
          placeholder="ul. Nowy Świat 15"
        />

        <div className={styles.formRow}>
          <FormField
            id="city"
            label="Miasto"
            value={values.city}
            onChange={(value) => {
              setFieldValue('city', value);
              setFieldTouched('city', true);
            }}
            error={touched.city ? errors.city : null}
            placeholder="Warszawa"
          />

          <FormField
            id="postal-code"
            label="Kod pocztowy"
            value={values.postalCode}
            onChange={(value) => {
              setFieldValue('postalCode', value);
              setFieldTouched('postalCode', true);
            }}
            error={touched.postalCode ? errors.postalCode : null}
            placeholder="00-001"
            helperText="Format: XX-XXX"
          />
        </div>
      </div>

      <div className={styles.stepActions}>
        <Button
          id="billing-back-btn"
          variant="outline"
          onClick={onBack}
        >
          <ChevronLeft size={16} /> Wstecz
        </Button>
        <div className={styles.rightActions}>
          <Button
            id="billing-skip-btn"
            variant="outline"
            onClick={onSkip}
          >
            <SkipForward size={16} /> Pomiń
          </Button>
          <Button
            id="billing-next-btn"
            onClick={handleNext}
          >
            Dalej <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

