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
}
