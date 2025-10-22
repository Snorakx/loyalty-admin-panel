import { supabase } from './supabase.client';

export interface Tenant {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
  background_image_url?: string;
  stamp_icon_url?: string;
  created_at: string;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  scan_code: string;
  created_at: string;
}

export interface LoyaltyProgram {
  id: string;
  tenant_id: string;
  stamps_required: number;
  reward_description: string;
  active: boolean;
  created_at: string;
}

export class TenantRepository {
  async getTenants(): Promise<Tenant[]> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tenants:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return [];
    }
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      
      if (error) {
        console.error('Error fetching tenant:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return null;
    }
  }

  async getLocations(tenantId?: string): Promise<Location[]> {
    try {
      let query = supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching locations:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  async getLoyaltyPrograms(tenantId?: string): Promise<LoyaltyProgram[]> {
    try {
      let query = supabase
        .from('loyalty_programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching loyalty programs:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error fetching loyalty programs:', error);
      return [];
    }
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'created_at'>): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating tenant:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating tenant:', error);
      return null;
    }
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating tenant:', error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error updating tenant:', error);
      return null;
    }
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', tenantId);
      
      if (error) {
        console.error('Error deleting tenant:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return false;
    }
  }

  // Get real statistics from database
  async getDashboardStats(tenantId?: string): Promise<{
    totalCustomers: number;
    totalStamps: number;
    activeCards: number;
    stampsToday: number;
    customersTrend: number;
    stampsTrend: number;
    cardsTrend: number;
    engagement: number;
    engagementTrend: number;
  }> {
    try {
      // Get total customers (unique users with cards)
      let customersQuery = supabase
        .from('customer_cards')
        .select('customer_id');
      
      if (tenantId) {
        customersQuery = customersQuery.eq('tenant_id', tenantId);
      }
      
      const { data: customersData, error: customersError } = await customersQuery;

      if (customersError) {
        console.error('Error fetching customers:', customersError);
      }

      // Get total stamps
      let stampsQuery = supabase
        .from('stamps')
        .select('id');
      
      if (tenantId) {
        stampsQuery = stampsQuery.eq('tenant_id', tenantId);
      }
      
      const { data: stampsData, error: stampsError } = await stampsQuery;

      if (stampsError) {
        console.error('Error fetching stamps:', stampsError);
      }

      // Get stamps from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let stampsTodayQuery = supabase
        .from('stamps')
        .select('id')
        .gte('stamped_at', today.toISOString());
      
      if (tenantId) {
        stampsTodayQuery = stampsTodayQuery.eq('tenant_id', tenantId);
      }
      
      const { data: stampsTodayData, error: stampsTodayError } = await stampsTodayQuery;

      if (stampsTodayError) {
        console.error('Error fetching today stamps:', stampsTodayError);
      }

      // Get active cards (cards with stamps > 0)
      let activeCardsQuery = supabase
        .from('customer_cards')
        .select('id')
        .gt('stamps_collected', 0);
      
      if (tenantId) {
        activeCardsQuery = activeCardsQuery.eq('tenant_id', tenantId);
      }
      
      const { data: activeCardsData, error: activeCardsError } = await activeCardsQuery;

      if (activeCardsError) {
        console.error('Error fetching active cards:', activeCardsError);
      }

      // Count unique customers
      const uniqueCustomers = new Set(customersData?.map(c => c.customer_id) || []).size;

      // Get data from previous 30 days for trend calculation
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Get customers from previous 30 days
      let customersLast30DaysQuery = supabase
        .from('customer_cards')
        .select('customer_id')
        .lte('created_at', thirtyDaysAgo.toISOString())
        .gte('created_at', sixtyDaysAgo.toISOString());
      
      if (tenantId) {
        customersLast30DaysQuery = customersLast30DaysQuery.eq('tenant_id', tenantId);
      }
      
      const { data: customersLast30DaysData } = await customersLast30DaysQuery;

      // Get stamps from previous 30 days
      let stampsLast30DaysQuery = supabase
        .from('stamps')
        .select('id')
        .lte('stamped_at', thirtyDaysAgo.toISOString())
        .gte('stamped_at', sixtyDaysAgo.toISOString());
      
      if (tenantId) {
        stampsLast30DaysQuery = stampsLast30DaysQuery.eq('tenant_id', tenantId);
      }
      
      const { data: stampsLast30DaysData } = await stampsLast30DaysQuery;

      // Get active cards from previous 30 days
      let activeCardsLast30DaysQuery = supabase
        .from('customer_cards')
        .select('id')
        .gt('stamps_collected', 0)
        .lte('created_at', thirtyDaysAgo.toISOString());
      
      if (tenantId) {
        activeCardsLast30DaysQuery = activeCardsLast30DaysQuery.eq('tenant_id', tenantId);
      }
      
      const { data: activeCardsLast30DaysData } = await activeCardsLast30DaysQuery;

      // Calculate trends
      const uniqueCustomersLast30Days = new Set(customersLast30DaysData?.map(c => c.customer_id) || []).size;
      const stampsLast30Days = stampsLast30DaysData?.length || 0;
      const activeCardsLast30Days = activeCardsLast30DaysData?.length || 0;

      // Calculate engagement metrics
      const currentEngagement = (activeCardsData?.length || 0) > 0 
        ? (stampsData?.length || 0) / (activeCardsData?.length || 1) 
        : 0;
      
      const previousEngagement = activeCardsLast30Days > 0 
        ? stampsLast30Days / activeCardsLast30Days 
        : 0;

      // Log for debugging
      console.log('Dashboard Stats Debug:', {
        uniqueCustomers,
        uniqueCustomersLast30Days,
        totalStamps: stampsData?.length || 0,
        stampsLast30Days,
        activeCards: activeCardsData?.length || 0,
        activeCardsLast30Days,
        stampsToday: stampsTodayData?.length || 0,
        currentEngagement,
        previousEngagement
      });

      const customersTrend = uniqueCustomersLast30Days > 0 
        ? Math.round(((uniqueCustomers - uniqueCustomersLast30Days) / uniqueCustomersLast30Days) * 100)
        : uniqueCustomers > 0 ? 100 : 0;
      
      const stampsTrend = stampsLast30Days > 0 
        ? Math.round(((stampsData?.length || 0) - stampsLast30Days) / stampsLast30Days * 100)
        : (stampsData?.length || 0) > 0 ? 100 : 0;
      
      const cardsTrend = activeCardsLast30Days > 0 
        ? Math.round(((activeCardsData?.length || 0) - activeCardsLast30Days) / activeCardsLast30Days * 100)
        : (activeCardsData?.length || 0) > 0 ? 100 : 0;
      
      const engagementTrend = previousEngagement > 0 
        ? Math.round(((currentEngagement - previousEngagement) / previousEngagement) * 100)
        : currentEngagement > 0 ? 100 : 0;

      return {
        totalCustomers: uniqueCustomers,
        totalStamps: stampsData?.length || 0,
        activeCards: activeCardsData?.length || 0,
        stampsToday: stampsTodayData?.length || 0,
        customersTrend,
        stampsTrend,
        cardsTrend,
        engagement: Math.round(currentEngagement * 10) / 10, // Round to 1 decimal place
        engagementTrend
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalCustomers: 0,
        totalStamps: 0,
        activeCards: 0,
        stampsToday: 0,
        customersTrend: 0,
        stampsTrend: 0,
        cardsTrend: 0,
        engagement: 0,
        engagementTrend: 0
      };
    }
  }
}
