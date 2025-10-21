import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card/Card';
import { BasicInfoStep } from '../components/OnboardingSteps/BasicInfoStep';
import { LocationStep } from '../components/OnboardingSteps/LocationStep';
import { BillingStep } from '../components/OnboardingSteps/BillingStep';
import { BrandingStep } from '../components/OnboardingSteps/BrandingStep';
import { ProgramStep } from '../components/OnboardingSteps/ProgramStep';
import { useToast } from '../contexts/ToastContext';
import { OnboardingService } from '../services/onboarding.service';
import { supabase } from '../repositories/supabase.client';
import styles from './OnboardingView.module.scss';

export interface OnboardingData {
  // Step 1: Business Info
  businessName: string;
  businessType: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  
  // Step 2: Location
  locationName: string;
  locationAddress: string;
  
  // Step 3: Billing (optional)
  companyName?: string;
  nip?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  
  // Step 4: Branding (optional)
  backgroundImage?: File;
  stampIcon?: File;
  logo?: File;
  
  // Step 5: Loyalty Program
  stampsRequired: number;
  rewardDescription: string;
}

const STEPS = [
  { id: 1, title: 'Informacje o biznesie', required: true },
  { id: 2, title: 'Pierwsza lokalizacja', required: true },
  { id: 3, title: 'Dane do faktury', required: false },
  { id: 4, title: 'Wygląd karty', required: false },
  { id: 5, title: 'Program lojalnościowy', required: true }
];

export const OnboardingView: React.FC = () => {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    businessName: '',
    businessType: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    locationName: '',
    locationAddress: '',
    stampsRequired: 10,
    rewardDescription: ''
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    if (!STEPS[currentStep - 1].required) {
      handleNext();
    }
  };

  const handleComplete = async () => {
    console.log('OnboardingView handleComplete called');
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showError('Nie jesteś zalogowany');
        return;
      }

      // Complete onboarding using service
      const onboardingService = new OnboardingService();
      const result = await onboardingService.completeOnboarding({
        businessName: data.businessName,
        businessType: data.businessType,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        locationName: data.locationName,
        locationAddress: data.locationAddress,
        companyName: data.companyName,
        nip: data.nip,
        streetAddress: data.streetAddress,
        city: data.city,
        postalCode: data.postalCode,
        backgroundImage: data.backgroundImage,
        logo: data.logo,
        stampIcon: data.stampIcon,
        stampsRequired: data.stampsRequired,
        rewardDescription: data.rewardDescription,
        userId: user.id
      });

      if (!result.success) {
        showError(result.error || 'Wystąpił błąd podczas rejestracji');
        return;
      }
      
      showSuccess('Rejestracja zakończona! Twój biznes oczekuje na zatwierdzenie.');
      
      // Navigate to dashboard (pending state)
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      showError('Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep data={data} updateData={updateData} onNext={handleNext} />;
      case 2:
        return <LocationStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <BillingStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      case 4:
        return <BrandingStep data={data} updateData={updateData} onNext={handleNext} onBack={handleBack} onSkip={handleSkip} />;
      case 5:
        return <ProgramStep data={data} updateData={updateData} onComplete={handleComplete} onBack={handleBack} loading={loading} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.onboardingView} id="onboarding-view">
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Konfiguracja biznesu</h1>
          <p className={styles.subtitle}>
            Wypełnij poniższe informacje, aby rozpocząć korzystanie z systemu
          </p>
        </div>

        {/* Progress indicator */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressSteps}>
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`${styles.progressStep} ${
                  currentStep === step.id ? styles.active : ''
                } ${currentStep > step.id ? styles.completed : ''}`}
              >
                <div className={styles.stepNumber}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <div className={styles.stepInfo}>
                  <div className={styles.stepTitle}>{step.title}</div>
                  {!step.required && (
                    <div className={styles.stepOptional}>Opcjonalne</div>
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={styles.stepConnector} />
                )}
              </div>
            ))}
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <Card className={styles.stepCard}>
          {renderStep()}
        </Card>
      </div>
    </div>
  );
};

