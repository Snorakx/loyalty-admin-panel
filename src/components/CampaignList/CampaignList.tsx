import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button/Button';
import { Eye } from 'lucide-react';
import { CampaignService, Campaign } from '../../services/campaign.service';
import { createLogger } from '../../utils/logger';
import styles from './CampaignList.module.scss';

const logger = createLogger('CampaignList');

interface CampaignListProps {
  campaigns: Campaign[];
  onRefresh?: () => void; // eslint-disable-line @typescript-eslint/no-unused-vars
}

const getSegmentLabel = (segmentType: string): string => {
  const labels: Record<string, string> = {
    all_customers: 'Wszyscy',
    active: 'Aktywni',
    inactive: 'Nieaktywni',
    near_reward: 'Blisko nagrody'
  };
  return labels[segmentType] || segmentType;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '-';
  }
};

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onRefresh }) => {
  const [stats, setStats] = useState<Record<string, any>>({});
  const [loadingStats, setLoadingStats] = useState<Set<string>>(new Set());
  const campaignService = new CampaignService();

  // Load stats for each campaign
  useEffect(() => {
    campaigns.forEach(async (campaign) => {
      if (campaign.onesignal_notification_id && !stats[campaign.id]) {
        setLoadingStats(prev => new Set(prev).add(campaign.id));
        
        try {
          const campaignStats = await campaignService.getCampaignStats(
            campaign.onesignal_notification_id
          );
          setStats(prev => ({
            ...prev,
            [campaign.id]: campaignStats
          }));
        } catch (error) {
          logger.error('Failed to load stats for campaign', error);
        } finally {
          setLoadingStats(prev => {
            const newSet = new Set(prev);
            newSet.delete(campaign.id);
            return newSet;
          });
        }
      }
    });
  }, [campaigns]);

  if (campaigns.length === 0) {
    return (
      <div className={styles.emptyState} id="campaigns-empty-state">
        <p className={styles.emptyMessage}>
          Brak wysłanych kampanii. Utwórz swoją pierwszą kampanię push!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.campaignList} id="campaigns-list">
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nazwa</th>
              <th>Tytuł</th>
              <th>Segment</th>
              <th>Wysłano</th>
              <th>Doręczono</th>
              <th>Data</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map(campaign => {
              const campaignStats = stats[campaign.id] || {};
              const isLoadingStats = loadingStats.has(campaign.id);
              const deliveryRate = campaignStats.sent 
                ? ((campaignStats.delivered / campaignStats.sent) * 100).toFixed(1)
                : '-';

              return (
                <tr key={campaign.id} className={styles.row} id={`campaign-row-${campaign.id}`}>
                  <td className={styles.nameCell}>
                    <span className={styles.campaignName}>{campaign.name || 'Bez nazwy'}</span>
                  </td>
                  <td className={styles.titleCell}>
                    <span className={styles.messageTitle}>{campaign.message_title}</span>
                  </td>
                  <td>
                    <span className={styles.badge} id={`campaign-segment-${campaign.id}`}>
                      {getSegmentLabel(campaign.segment_type)}
                    </span>
                  </td>
                  <td className={styles.statsCell}>
                    {isLoadingStats ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      <span>{campaignStats.sent || campaign.target_count || '-'}</span>
                    )}
                  </td>
                  <td className={styles.statsCell}>
                    {isLoadingStats ? (
                      <span className={styles.loading}>...</span>
                    ) : (
                      <>
                        <span>{campaignStats.delivered || '-'}</span>
                        {campaignStats.sent && (
                          <span className={styles.rate}> ({deliveryRate}%)</span>
                        )}
                      </>
                    )}
                  </td>
                  <td className={styles.dateCell}>{formatDate(campaign.sent_at)}</td>
                  <td>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        // TODO: Show campaign details modal
                        logger.info('View campaign details', { id: campaign.id });
                      }}
                      id={`campaign-view-btn-${campaign.id}`}
                    >
                      <Eye size={16} />
                      Zobacz
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

