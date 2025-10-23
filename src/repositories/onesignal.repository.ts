import { createLogger } from '../utils/logger';

const logger = createLogger('OneSignalRepository');

export class OneSignalRepository {
  private appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
  private apiKey = import.meta.env.VITE_ONESIGNAL_REST_API_KEY;
  private baseUrl = 'https://onesignal.com/api/v1';

  // Send notification to segment
  async sendNotification(params: {
    title: string;
    message: string;
    tenantId: string; // KLUCZOWE - filtrowanie per tenant
    segmentType?: 'all' | 'active' | 'inactive' | 'near_reward' | 'test_all_subscribers';
  }): Promise<{ id: string; recipients: number }> {
    try {
      // TEST MODE: Send to ALL subscribers (no filters) - ONLY FOR DEBUGGING!
      const isTestMode = params.segmentType === 'test_all_subscribers';
      
      // Build filters based on segment (skip for test mode)
      const filters = isTestMode ? undefined : this.buildFilters(params.tenantId, params.segmentType);

      logger.info('Sending notification', { 
        filters, 
        title: params.title,
        testMode: isTestMode,
        expectedTag: `tenant_ids contains ${params.tenantId}` 
      });

      const payload: any = {
        app_id: this.appId,
        headings: { en: params.title },
        contents: { en: params.message },
        // iOS/Android specific
        ios_badgeType: 'Increase',
        ios_badgeCount: 1,
      };

      // Add filters OR included_segments for test mode
      if (isTestMode) {
        // TEST MODE: Send to "All Subscribers" segment
        payload.included_segments = ['All'];
        logger.warn('⚠️ TEST MODE: Sending to ALL subscribers (no tenant filtering!)');
      } else {
        payload.filters = filters;
      }

      logger.debug('OneSignal request payload', payload);

      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error('OneSignal API error', { 
          status: response.status, 
          error: data,
          payload: payload 
        });
        throw new Error(`OneSignal API error: ${JSON.stringify(data.errors || data)}`);
      }

      logger.success('Notification sent successfully', { id: data.id, recipients: data.recipients });
      
      return {
        id: data.id,
        recipients: data.recipients || 0
      };
    } catch (error) {
      logger.error('Failed to send notification', error);
      throw error;
    }
  }

  // Preview segment - ile użytkowników zostanie objętych
  // NOTE: Only works for basic "all_customers" segment
  // Advanced segments (active/inactive/near_reward) require Supabase query
  async getSegmentCount(tenantId: string, segmentType: string): Promise<number> {
    try {
      // For advanced segments, return 0 (requires Supabase implementation)
      if (segmentType !== 'all' && segmentType !== 'all_customers' && segmentType !== 'test_all_subscribers') {
        logger.info(`Preview not available for '${segmentType}' - requires Supabase query implementation`);
        return 0;
      }

      const filters = this.buildFilters(tenantId, segmentType);
      
      logger.debug('Getting segment count', { tenantId, segmentType, filters });

      // OneSignal /notifications endpoint returns estimated recipients
      // Note: We schedule it in the future but will cancel it after getting the count
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${this.apiKey}`
        },
        body: JSON.stringify({
          app_id: this.appId,
          filters: filters,
          headings: { en: 'Preview' },
          contents: { en: 'Preview' },
          // Schedule 7 days in future (OneSignal max is ~30 days)
          send_after: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
      });

      if (!response.ok) {
        logger.warn('Failed to get segment count', { status: response.status });
        return 0;
      }

      const data = await response.json();
      const count = data.recipients || 0;
      
      // Cancel the scheduled notification (we only wanted the count)
      if (data.id) {
        try {
          await fetch(`${this.baseUrl}/notifications/${data.id}?app_id=${this.appId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Basic ${this.apiKey}` }
          });
          logger.debug('Cancelled preview notification');
        } catch (e) {
          logger.warn('Could not cancel preview notification', e);
        }
      }
      
      if (count === 0) {
        logger.warn('Preview returned 0 recipients - check if users are tagged with tenant_ids');
      } else {
        logger.debug('Segment count retrieved', { count });
      }
      
      return count;
    } catch (error) {
      logger.error('Failed to get segment count', error);
      return 0;
    }
  }

  // Get campaign stats
  async getCampaignStats(notificationId: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications/${notificationId}?app_id=${this.appId}`,
        {
          headers: { 'Authorization': `Basic ${this.apiKey}` }
        }
      );

      if (!response.ok) {
        logger.warn('Failed to get campaign stats', { notificationId, status: response.status });
        return {
          sent: 0,
          delivered: 0,
          failed: 0,
          remaining: 0
        };
      }

      const data = await response.json();
      return {
        sent: data.successful || 0,
        delivered: data.converted || 0, // OneSignal uses "converted" for delivered
        failed: data.failed || 0,
        remaining: data.remaining || 0,
      };
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

  // KLUCZOWE: Build filters per tenant
  // NEW STRATEGY: Only use 'tenant_ids' tag with contains relation
  // Advanced segments (active/inactive/near_reward) should query Supabase 
  // and use include_external_user_ids instead
  private buildFilters(tenantId: string, segmentType?: string) {
    // SIMPLIFIED: Only basic tenant filter
    // For "all_customers" segment - filter by tenant_ids tag
    // tenant_ids format: "uuid-1,uuid-2,uuid-3" (comma-separated)
    
    if (segmentType === 'all' || segmentType === 'all_customers' || !segmentType) {
      // Simple filter: tenant_ids contains this tenant's UUID
      return [
        { field: 'tag', key: 'tenant_ids', relation: 'contains', value: tenantId }
      ];
    }
    
    // For advanced segments (active/inactive/near_reward):
    // These should query Supabase and use include_external_user_ids
    // Returning empty filters as fallback (will need to be handled in sendNotification)
    logger.warn(`Advanced segment '${segmentType}' requires Supabase query - not implemented yet`);
    
    // Fallback to basic filter
    return [
      { field: 'tag', key: 'tenant_ids', relation: 'contains', value: tenantId }
    ];
  }
}

