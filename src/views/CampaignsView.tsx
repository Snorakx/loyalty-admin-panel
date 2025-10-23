import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button/Button';
import { CampaignForm, CampaignFormData } from '../components/CampaignForm';
import { CampaignList } from '../components/CampaignList';
import { CampaignService, Campaign } from '../services/campaign.service';
import { AuthService } from '../services/auth.service';
import { Loader } from '../components/ui/Loader/Loader';
import { Send } from 'lucide-react';
import { createLogger } from '../utils/logger';
import styles from './CampaignsView.module.scss';

const logger = createLogger('CampaignsView');

export const CampaignsView: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const campaignService = new CampaignService();
  const authService = AuthService.getInstance();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await authService.getCurrentUser();
      
      if (user?.tenant_id) {
        const data = await campaignService.getCampaigns(user.tenant_id);
        setCampaigns(data);
        logger.info('Campaigns loaded', { count: data.length });
      } else {
        logger.warn('No tenant_id found for user');
      }
    } catch (error) {
      logger.error('Failed to load campaigns', error);
      setError('Nie udało się załadować kampanii');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (formData: CampaignFormData) => {
    const user = await authService.getCurrentUser();
    if (!user?.tenant_id) {
      setError('Błąd: Nie znaleziono ID firmy');
      return;
    }

    try {
      setSending(true);
      setError(null);
      setSuccess(null);

      logger.info('Sending campaign', formData);

      const result = await campaignService.sendCampaign({
        ...formData,
        tenantId: user.tenant_id,
        createdBy: user.id
      });

      if (result.success) {
        setSuccess('Kampania została wysłana pomyślnie!');
        setShowForm(false);
        await loadCampaigns();
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(`Błąd: ${result.error || 'Nie udało się wysłać kampanii'}`);
      }
    } catch (error: any) {
      logger.error('Failed to send campaign', error);
      const errorMessage = error?.message || 'Wystąpił błąd podczas wysyłania kampanii';
      setError(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer} id="campaigns-loading">
        <Loader text="Ładowanie kampanii..." />
      </div>
    );
  }

  return (
    <div className={styles.campaignsView} id="campaigns-view">
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Kampanie Push</h1>
          <p className={styles.subtitle}>
            Zarządzaj kampaniami push i wysyłaj notyfikacje do swoich klientów
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          disabled={sending}
          id="new-campaign-btn"
        >
          <Send size={16} />
          Nowa kampania
        </Button>
      </div>

      {error && (
        <div className={styles.alert} id="campaign-error">
          <div className={styles.alertError}>
            <strong>Błąd:</strong> {error}
            <button 
              className={styles.alertClose}
              onClick={() => setError(null)}
              aria-label="Zamknij alert"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className={styles.alert} id="campaign-success">
          <div className={styles.alertSuccess}>
            <strong>Sukces!</strong> {success}
            <button 
              className={styles.alertClose}
              onClick={() => setSuccess(null)}
              aria-label="Zamknij alert"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <CampaignForm
          onSubmit={handleSendCampaign}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className={styles.content}>
        <CampaignList 
          campaigns={campaigns} 
          onRefresh={loadCampaigns}
        />
      </div>
    </div>
  );
};

