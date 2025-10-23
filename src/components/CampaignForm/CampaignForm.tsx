import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card/Card';
import { Button } from '../ui/Button/Button';
import { Input } from '../ui/Input/Input';
import { Send, X } from 'lucide-react';
import { CampaignService } from '../../services/campaign.service';
import { AuthService } from '../../services/auth.service';
import { createLogger } from '../../utils/logger';
import styles from './CampaignForm.module.scss';

const logger = createLogger('CampaignForm');

export interface CampaignFormData {
  name: string;
  title: string;
  message: string;
  segmentType: 'all_customers' | 'active' | 'inactive' | 'near_reward' | 'test_all_subscribers' | string;
}

interface CampaignFormProps {
  onSubmit: (data: CampaignFormData) => void;
  onCancel: () => void;
}

export const CampaignForm: React.FC<CampaignFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    title: '',
    message: '',
    segmentType: 'all_customers'
  });
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const campaignService = new CampaignService();
  const authService = AuthService.getInstance();

  // Preview segment count when segment changes
  useEffect(() => {
    loadPreview();
  }, [formData.segmentType]);

  const loadPreview = async () => {
    try {
      setLoadingPreview(true);
      const user = await authService.getCurrentUser();
      if (user?.tenant_id) {
        const count = await campaignService.previewSegment(
          user.tenant_id,
          formData.segmentType
        );
        setPreviewCount(count);
      }
    } catch (error) {
      logger.error('Failed to load preview', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) return;
    
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  // Allow sending even with 0 preview count (preview may be incorrect or delayed)
  const isValid = formData.title && formData.message;

  return (
    <Card className={styles.campaignForm} id="campaign-form">
      <div className={styles.header}>
        <h2 className={styles.title}>Nowa kampania push</h2>
        <button 
          className={styles.closeButton} 
          onClick={onCancel}
          aria-label="Zamknij formularz"
          id="campaign-form-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      <div className={styles.formContent}>
        <div className={styles.formGroup}>
          <Input
            id="campaign-name-input"
            label="Nazwa kampanii (wewnętrzna)"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="np. Promocja weekendowa"
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            id="campaign-title-input"
            label="Tytuł notyfikacji"
            value={formData.title}
            onChange={(value) => setFormData({ ...formData, title: value })}
            placeholder="max 60 znaków"
            maxLength={60}
          />
          <span className={styles.charCount}>{formData.title.length}/60</span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="campaign-message-textarea" className={styles.label}>
            Treść
          </label>
          <textarea
            id="campaign-message-textarea"
            className={styles.textarea}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="max 120 znaków"
            maxLength={120}
            rows={3}
          />
          <span className={styles.charCount}>{formData.message.length}/120</span>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="campaign-segment-select" className={styles.label}>
            Segment odbiorców
          </label>
          <select
            id="campaign-segment-select"
            className={styles.select}
            value={formData.segmentType}
            onChange={(e) => setFormData({ ...formData, segmentType: e.target.value })}
          >
            <option value="all_customers">
              Wszyscy klienci {loadingPreview ? '(ładowanie...)' : `(${previewCount})`}
            </option>
            <option value="active">Aktywni (ostatnie 30 dni)</option>
            <option value="inactive">Nieaktywni (30+ dni)</option>
            <option value="near_reward">Blisko nagrody (≥80%)</option>
            {/* TODO: Add geolocation segment */}
            {/* <option value="near_location">W pobliżu lokalu (geofencing)</option> */}
            <option value="test_all_subscribers" style={{ backgroundColor: '#FEF3C7', fontWeight: 'bold' }}>
              🧪 TEST MODE - Wszyscy zasubskrybowani (bez filtrów)
            </option>
          </select>
        </div>

        {/* Preview */}
        <div className={styles.preview}>
          <h3 className={styles.previewTitle}>Podgląd notyfikacji:</h3>
          <div className={styles.mockNotification} id="notification-preview">
            <div className={styles.notifIcon}>🔔</div>
            <div className={styles.notifContent}>
              <strong className={styles.notifTitle}>
                {formData.title || 'Tytuł notyfikacji'}
              </strong>
              <p className={styles.notifMessage}>
                {formData.message || 'Treść notyfikacji pojawi się tutaj...'}
              </p>
            </div>
          </div>
          <p className={styles.targetInfo}>
            Zostanie wysłane do <strong>{previewCount}</strong> użytkowników
          </p>
          {previewCount === 0 && !loadingPreview && (
            <div className={styles.warning} id="zero-recipients-warning">
              ⚠️ Preview pokazuje 0 odbiorców. To może oznaczać:
              <ul>
                <li>Brak użytkowników z odpowiednimi tagami</li>
                <li>Preview jeszcze się nie załadował (spróbuj poczekać)</li>
                <li>Użytkownicy nie są zatagowani (sprawdź OneSignal Dashboard)</li>
              </ul>
              Możesz wysłać mimo to, ale prawdopodobnie nikt nie dostanie notyfikacji.
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={loading}
            id="campaign-cancel-btn"
          >
            Anuluj
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={!isValid || loading}
            id="campaign-send-btn"
          >
            <Send size={16} />
            {loading ? 'Wysyłanie...' : 'Wyślij teraz'}
          </Button>
        </div>

        {/* TODO: Scheduling */}
        {/* <Button variant="outline">Zaplanuj na później</Button> */}
      </div>
    </Card>
  );
};

