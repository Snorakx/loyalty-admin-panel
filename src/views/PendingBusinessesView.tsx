import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card/Card';
import { Button } from '../components/ui/Button/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '../components/ui/Table';
import { ApprovalService } from '../services/approval.service';
import { PendingBusiness } from '../repositories/approval.repository';
import { ArrowLeft, Eye, Clock } from 'lucide-react';
import styles from './PendingBusinessesView.module.scss';

export const PendingBusinessesView: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<PendingBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvalService] = useState(() => new ApprovalService());

  useEffect(() => {
    loadPendingBusinesses();
  }, []);

  const loadPendingBusinesses = async () => {
    setLoading(true);
    try {
      const data = await approvalService.getPendingBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error('Error loading pending businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.pendingBusinessesView} id="pending-businesses-view">
      <div className={styles.header}>
        <Button
          id="back-to-dashboard-btn"
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} /> Powrót do dashboardu
        </Button>
      </div>

      <Card className={styles.content}>
        <div className={styles.cardHeader}>
          <div>
            <h1 className={styles.title}>Oczekujące aplikacje</h1>
            <p className={styles.subtitle}>
              {businesses.length} {businesses.length === 1 ? 'biznes oczekuje' : 'biznesów oczekuje'} na zatwierdzenie
            </p>
          </div>
          <div className={styles.badge}>
            <Clock size={16} />
            {businesses.length}
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Ładowanie...</div>
        ) : businesses.length === 0 ? (
          <div className={styles.emptyState}>
            <Clock size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Brak oczekujących aplikacji</h3>
            <p className={styles.emptyText}>
              Wszystkie biznesy zostały już zatwierdzone lub odrzucone
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Nazwa biznesu</TableHeaderCell>
              <TableHeaderCell>Typ</TableHeaderCell>
              <TableHeaderCell>Właściciel</TableHeaderCell>
              <TableHeaderCell>Data rejestracji</TableHeaderCell>
              <TableHeaderCell>Akcje</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {businesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <strong>{business.name}</strong>
                  </TableCell>
                  <TableCell>{business.business_type}</TableCell>
                  <TableCell>
                    {business.owner_email || 'Brak danych'}
                  </TableCell>
                  <TableCell>{formatDate(business.created_at)}</TableCell>
                  <TableCell>
                    <Button
                      id={`view-details-${business.id}`}
                      size="sm"
                      onClick={() => navigate(`/pending-businesses/${business.id}`)}
                    >
                      <Eye size={14} /> Szczegóły
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

