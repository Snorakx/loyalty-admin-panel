import { OneSignalRepository } from '../repositories/onesignal.repository';
import { supabase as supabaseClient } from '../repositories/supabase.client';
import { createLogger } from '../utils/logger';

const logger = createLogger('CampaignService');

export interface Campaign {
  id: string;
  tenant_id: string;
  onesignal_notification_id: string | null;
  name: string;
  message_title: string;
  message_body: string;
  segment_type: string;
  target_count: number | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
}

export class CampaignService {
  private oneSignalRepo = new OneSignalRepository();
  private supabase = supabaseClient;

  // Send campaign now
  async sendCampaign(params: {
    name: string;
    title: string;
    message: string;
    tenantId: string;
    segmentType: string;
    createdBy: string;
  }): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      logger.info('Sending campaign', { name: params.name, tenantId: params.tenantId });

      // Send via OneSignal
      const result = await this.oneSignalRepo.sendNotification({
        title: params.title,
        message: params.message,
        tenantId: params.tenantId,
        segmentType: params.segmentType as any
      });

      logger.success('Campaign sent via OneSignal', { id: result.id, recipients: result.recipients });

      // Save to Supabase (optional - for history)
      const { data, error } = await this.supabase
        .from('push_campaigns')
        .insert({
          tenant_id: params.tenantId,
          onesignal_notification_id: result.id,
          name: params.name,
          message_title: params.title,
          message_body: params.message,
          segment_type: params.segmentType,
          target_count: result.recipients,
          sent_at: new Date().toISOString(),
          created_by: params.createdBy
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to save campaign to DB', error);
        // Don't fail the whole operation if DB save fails
      }

      return {
        success: true,
        campaignId: data?.id
      };
    } catch (error) {
      logger.error('Failed to send campaign', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get campaign history (from Supabase)
  async getCampaigns(tenantId: string): Promise<Campaign[]> {
    try {
      const { data, error } = await this.supabase
        .from('push_campaigns')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch campaigns', error);
        throw error;
      }

      logger.debug('Campaigns fetched', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      logger.error('Failed to get campaigns', error);
      return [];
    }
  }

  // Preview segment count
  async previewSegment(tenantId: string, segmentType: string): Promise<number> {
    try {
      return await this.oneSignalRepo.getSegmentCount(tenantId, segmentType);
    } catch (error) {
      logger.error('Failed to preview segment', error);
      return 0;
    }
  }

  // Get campaign analytics
  async getCampaignStats(onesignalNotificationId: string) {
    try {
      return await this.oneSignalRepo.getCampaignStats(onesignalNotificationId);
    } catch (error) {
      logger.error('Failed to get campaign stats', error);
      return {
        sent: 0,
        delivered: 0,
        failed: 0,
        remaining: 0
      };
    }
  }
}

