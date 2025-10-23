import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Alert } from '../components/ui/Alert/Alert';
import { ApprovalService } from '../services/approval.service';
import { BusinessDetails } from '../repositories/approval.repository';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../repositories/supabase.client';
import { Loader } from '../components/ui/Loader';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Building2, MapPin, CreditCard, Image as ImageIcon, Award } from 'lucide-react';
import styles from './BusinessApprovalView.module.scss';

export const BusinessApprovalView: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [business, setBusiness] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showRequestChanges, setShowRequestChanges] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [changeNotes, setChangeNotes] = useState('');
  
  const [approvalService] = useState(() => new ApprovalService());

  useEffect(() => {
    if (tenantId) {
      loadBusinessDetails();
    }
  }, [tenantId]);

  const loadBusinessDetails = async () => {
    setLoading(true);
    try {
      const data = await approvalService.getBusinessDetails(tenantId!);
      setBusiness(data);
    } catch (error) {
      console.error('Error loading business details:', error);
      showError('Nie udało się załadować szczegółów biznesu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!business) return;
    
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Nie jesteś zalogowany');
        return;
      }

      const result = await approvalService.approveBusiness(business.tenant.id, user.id);
      
      if (result.success) {
        showSuccess('Biznes został zatwierdzony!');
        navigate('/pending-businesses');
      } else {
        showError(result.error || 'Nie udało się zatwierdzić biznesu');
      }
    } catch (error) {
      console.error('Error approving business:', error);
      showError('Wystąpił błąd podczas zatwierdzania');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!business || !rejectionReason.trim()) {
      showError('Podaj powód odrzucenia');
      return;
    }
    
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showError('Nie jesteś zalogowany');
        return;
      }

      const result = await approvalService.rejectBusiness(business.tenant.id, rejectionReason, user.id);
      
      if (result.success) {
        showSuccess('Biznes został odrzucony');
        navigate('/pending-businesses');
      } else {
        showError(result.error || 'Nie udało się odrzucić biznesu');
      }
    } catch (error) {
      console.error('Error rejecting business:', error);
      showError('Wystąpił błąd podczas odrzucania');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!business || !changeNotes.trim()) {
      showError('Podaj notatki o wymaganych zmianach');
      return;
    }
    
    setActionLoading(true);
    try {
      const result = await approvalService.requestChanges(business.tenant.id, changeNotes);
      
      if (result.success) {
        showSuccess('Wysłano prośbę o zmiany');
        setShowRequestChanges(false);
        setChangeNotes('');
      } else {
        showError(result.error || 'Nie udało się wysłać prośby');
      }
    } catch (error) {
      console.error('Error requesting changes:', error);
      showError('Wystąpił błąd podczas wysyłania');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateCompleteness = () => {
    if (!business) return 0;
    let score = 3; // Business info, location, loyalty program always complete
    if (business.billingInfo) score++;
    if (business.tenant.background_image_url) score++;
    if (business.tenant.logo_url) score++;
    if (business.tenant.stamp_icon_url) score++;
    return score;
  };

  if (loading) {
    return (
      <div className={styles.businessApprovalView}>
        <Loader 
          size="lg" 
          variant="wave" 
          text="Ładowanie szczegółów biznesu..." 
        />
      </div>
    );
  }

  if (!business) {
    return (
      <div className={styles.error}>
        <Alert variant="error" message="Nie znaleziono biznesu" />
        <Button onClick={() => navigate('/pending-businesses')}>
          Powrót do listy
        </Button>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className={styles.businessApprovalView} id="business-approval-view">
      <div className={styles.header}>
        <Button
          id="back-to-list-btn"
          variant="outline"
          onClick={() => navigate('/pending-businesses')}
        >
          <ArrowLeft size={16} /> Powrót do listy
        </Button>
        <div className={styles.completeness}>
          Kompletność profilu: <strong>{completeness}/7</strong>
        </div>
      </div>

      <div className={styles.content}>
        <h1 className={styles.title}>Przegląd aplikacji biznesu</h1>

        {/* Business Information */}
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <Building2 size={20} />
            <h2>Informacje o biznesie</h2>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nazwa:</span>
              <span className={styles.value}>{business.tenant.name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Typ:</span>
              <span className={styles.value}>{business.tenant.business_type}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Osoba kontaktowa:</span>
              <span className={styles.value}>{business.tenant.contact_person}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{business.tenant.contact_email}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Telefon:</span>
              <span className={styles.value}>{business.tenant.contact_phone}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Data rejestracji:</span>
              <span className={styles.value}>
                {new Date(business.tenant.created_at).toLocaleDateString('pl-PL')}
              </span>
            </div>
          </div>
          {business.owner && (
            <div className={styles.ownerInfo}>
              <strong>Właściciel:</strong> {business.owner.email}
            </div>
          )}
        </Card>

        {/* Location */}
        {business.location && (
          <Card className={styles.section}>
            <div className={styles.sectionHeader}>
              <MapPin size={20} />
              <h2>Lokalizacja</h2>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Nazwa:</span>
                <span className={styles.value}>{business.location.name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Adres:</span>
                <span className={styles.value}>{business.location.address}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Kod skanowania:</span>
                <span className={styles.value}>
                  <code>{business.location.scan_code}</code>
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Billing Info */}
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <CreditCard size={20} />
            <h2>Dane do faktury</h2>
          </div>
          {business.billingInfo ? (
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Nazwa firmy:</span>
                <span className={styles.value}>{business.billingInfo.company_name}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>NIP:</span>
                <span className={styles.value}>
                  {business.billingInfo.nip} <span className={styles.valid}>✓ Poprawny</span>
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Adres:</span>
                <span className={styles.value}>
                  {business.billingInfo.street_address}, {business.billingInfo.postal_code} {business.billingInfo.city}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.notProvided}>
              <span className={styles.badge}>Nie podano</span>
              <p>Właściciel może dodać te dane później</p>
            </div>
          )}
        </Card>

        {/* Branding */}
        <Card className={styles.section}>
          <div className={styles.sectionHeader}>
            <ImageIcon size={20} />
            <h2>Wygląd karty</h2>
          </div>
          <div className={styles.brandingGrid}>
            <div className={styles.brandingItem}>
              <span className={styles.label}>Tło karty:</span>
              {business.tenant.background_image_url ? (
                <img src={business.tenant.background_image_url} alt="Tło" className={styles.brandingImage} />
              ) : (
                <div className={styles.placeholder}>Nie dodano</div>
              )}
            </div>
            <div className={styles.brandingItem}>
              <span className={styles.label}>Logo:</span>
              {business.tenant.logo_url ? (
                <img src={business.tenant.logo_url} alt="Logo" className={styles.brandingImage} />
              ) : (
                <div className={styles.placeholder}>Nie dodano</div>
              )}
            </div>
            <div className={styles.brandingItem}>
              <span className={styles.label}>Ikona pieczątki:</span>
              {business.tenant.stamp_icon_url ? (
                <img src={business.tenant.stamp_icon_url} alt="Pieczątka" className={styles.brandingImage} />
              ) : (
                <div className={styles.placeholder}>Nie dodano</div>
              )}
            </div>
          </div>
        </Card>

        {/* Loyalty Program */}
        {business.loyaltyProgram && (
          <Card className={styles.section}>
            <div className={styles.sectionHeader}>
              <Award size={20} />
              <h2>Program lojalnościowy</h2>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Liczba pieczątek:</span>
                <span className={styles.value}>{business.loyaltyProgram.stamps_required}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Nagroda:</span>
                <span className={styles.value}>{business.loyaltyProgram.reward_description}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card className={styles.actions}>
          {!showRejectForm && !showRequestChanges && (
            <div className={styles.actionButtons}>
              <Button
                id="approve-btn"
                onClick={handleApprove}
                disabled={actionLoading}
                className={styles.approveButton}
              >
                <CheckCircle size={16} /> Zatwierdź biznes
              </Button>
              <Button
                id="request-changes-btn"
                variant="outline"
                onClick={() => setShowRequestChanges(true)}
                disabled={actionLoading}
              >
                <AlertCircle size={16} /> Poproś o zmiany
              </Button>
              <Button
                id="reject-btn"
                variant="danger"
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
              >
                <XCircle size={16} /> Odrzuć aplikację
              </Button>
            </div>
          )}

          {showRejectForm && (
            <div className={styles.rejectForm}>
              <h3>Odrzuć aplikację</h3>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Podaj powód odrzucenia (minimum 10 znaków)..."
                rows={4}
                className={styles.textarea}
              />
              <div className={styles.formActions}>
                <Button
                  id="confirm-reject-btn"
                  variant="danger"
                  onClick={handleReject}
                  disabled={actionLoading || rejectionReason.length < 10}
                >
                  Potwierdź odrzucenie
                </Button>
                <Button
                  id="cancel-reject-btn"
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  disabled={actionLoading}
                >
                  Anuluj
                </Button>
              </div>
            </div>
          )}

          {showRequestChanges && (
            <div className={styles.requestChangesForm}>
              <h3>Poproś o zmiany</h3>
              <textarea
                id="change-notes"
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                placeholder="Opisz jakie zmiany są potrzebne (minimum 10 znaków)..."
                rows={4}
                className={styles.textarea}
              />
              <div className={styles.formActions}>
                <Button
                  id="send-request-btn"
                  onClick={handleRequestChanges}
                  disabled={actionLoading || changeNotes.length < 10}
                >
                  Wyślij prośbę
                </Button>
                <Button
                  id="cancel-request-btn"
                  variant="outline"
                  onClick={() => {
                    setShowRequestChanges(false);
                    setChangeNotes('');
                  }}
                  disabled={actionLoading}
                >
                  Anuluj
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

