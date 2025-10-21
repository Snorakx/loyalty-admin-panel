import React, { useState } from 'react';
import { Button } from '../ui/Button/Button';
import { Alert } from '../ui/Alert/Alert';
import { validateImageFile, fileToBase64 } from '../../utils/imageOptimization';
import { OnboardingData } from '../../views/OnboardingView';
import { ChevronLeft, ChevronRight, SkipForward, Upload, X } from 'lucide-react';
import styles from './OnboardingSteps.module.scss';

interface BrandingStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export const BrandingStep: React.FC<BrandingStepProps> = ({ 
  data, 
  updateData, 
  onNext, 
  onBack, 
  onSkip 
}) => {
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (
    file: File, 
    type: 'background' | 'logo' | 'stamp',
    maxSizeMB: number
  ) => {
    setError(null);

    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.valid) {
      setError(validation.error || 'Nieprawidłowy plik');
      return;
    }

    try {
      const preview = await fileToBase64(file);
      
      if (type === 'background') {
        setBackgroundPreview(preview);
        updateData({ backgroundImage: file });
      } else if (type === 'logo') {
        setLogoPreview(preview);
        updateData({ logo: file });
      } else if (type === 'stamp') {
        setStampPreview(preview);
        updateData({ stampIcon: file });
      }
    } catch (err) {
      setError('Nie udało się wczytać pliku');
    }
  };

  const handleRemove = (type: 'background' | 'logo' | 'stamp') => {
    if (type === 'background') {
      setBackgroundPreview(null);
      updateData({ backgroundImage: undefined });
    } else if (type === 'logo') {
      setLogoPreview(null);
      updateData({ logo: undefined });
    } else if (type === 'stamp') {
      setStampPreview(null);
      updateData({ stampIcon: undefined });
    }
  };

  const hasAnyImage = backgroundPreview || logoPreview || stampPreview;

  return (
    <div className={styles.stepContent} id="branding-step">
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Wygląd karty lojalnościowej</h2>
        <p className={styles.stepDescription}>
          Dodaj obrazy, które będą widoczne na karcie lojalnościowej Twoich klientów
        </p>
      </div>

      {error && (
        <Alert variant="error" message={error} onClose={() => setError(null)} />
      )}

      <div className={styles.stepForm}>
        {/* Background Image */}
        <div className={styles.uploadSection}>
          <label className={styles.uploadLabel}>
            Tło karty <span className={styles.optional}>(opcjonalne)</span>
          </label>
          <p className={styles.uploadDescription}>
            Obraz tła karty lojalnościowej. Max 2MB, JPG lub PNG
          </p>
          {backgroundPreview ? (
            <div className={styles.imagePreview}>
              <img src={backgroundPreview} alt="Tło karty" className={styles.previewImage} />
              <button
                className={styles.removeButton}
                onClick={() => handleRemove('background')}
                type="button"
              >
                <X size={16} /> Usuń
              </button>
            </div>
          ) : (
            <label className={styles.uploadBox} htmlFor="background-upload">
              <Upload size={24} />
              <span>Kliknij aby wybrać plik</span>
              <input
                id="background-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'background', 2);
                }}
                className={styles.fileInput}
              />
            </label>
          )}
        </div>

        {/* Logo */}
        <div className={styles.uploadSection}>
          <label className={styles.uploadLabel}>
            Logo <span className={styles.optional}>(opcjonalne)</span>
          </label>
          <p className={styles.uploadDescription}>
            Logo Twojego biznesu. Max 1MB, JPG, PNG lub SVG
          </p>
          {logoPreview ? (
            <div className={styles.imagePreview}>
              <img src={logoPreview} alt="Logo" className={styles.previewImage} />
              <button
                className={styles.removeButton}
                onClick={() => handleRemove('logo')}
                type="button"
              >
                <X size={16} /> Usuń
              </button>
            </div>
          ) : (
            <label className={styles.uploadBox} htmlFor="logo-upload">
              <Upload size={24} />
              <span>Kliknij aby wybrać plik</span>
              <input
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo', 1);
                }}
                className={styles.fileInput}
              />
            </label>
          )}
        </div>

        {/* Stamp Icon */}
        <div className={styles.uploadSection}>
          <label className={styles.uploadLabel}>
            Ikona pieczątki <span className={styles.optional}>(opcjonalne)</span>
          </label>
          <p className={styles.uploadDescription}>
            Ikona używana jako pieczątka na karcie. Max 500KB, PNG lub SVG
          </p>
          {stampPreview ? (
            <div className={styles.imagePreview}>
              <img src={stampPreview} alt="Pieczątka" className={styles.previewImage} />
              <button
                className={styles.removeButton}
                onClick={() => handleRemove('stamp')}
                type="button"
              >
                <X size={16} /> Usuń
              </button>
            </div>
          ) : (
            <label className={styles.uploadBox} htmlFor="stamp-upload">
              <Upload size={24} />
              <span>Kliknij aby wybrać plik</span>
              <input
                id="stamp-upload"
                type="file"
                accept="image/png,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'stamp', 0.5);
                }}
                className={styles.fileInput}
              />
            </label>
          )}
        </div>

        {/* Live Preview */}
        {hasAnyImage && (
          <div className={styles.previewSection}>
            <h3 className={styles.previewTitle}>Podgląd karty</h3>
            <div className={styles.cardPreview}>
              {backgroundPreview && (
                <div 
                  className={styles.cardBackground}
                  style={{ backgroundImage: `url(${backgroundPreview})` }}
                />
              )}
              <div className={styles.cardContent}>
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className={styles.cardLogo} />
                )}
                <div className={styles.cardStamps}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className={styles.stampSlot}>
                      {stampPreview && i < 3 && (
                        <img src={stampPreview} alt="Pieczątka" className={styles.stampIcon} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.stepActions}>
        <Button
          id="branding-back-btn"
          variant="outline"
          onClick={onBack}
        >
          <ChevronLeft size={16} /> Wstecz
        </Button>
        <div className={styles.rightActions}>
          <Button
            id="branding-skip-btn"
            variant="outline"
            onClick={onSkip}
          >
            <SkipForward size={16} /> Pomiń
          </Button>
          <Button
            id="branding-next-btn"
            onClick={onNext}
          >
            Dalej <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

