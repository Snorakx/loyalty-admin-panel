import { supabase } from './supabase.client';

export interface PendingBusiness {
  id: string;
  name: string;
  business_type: string;
  contact_email: string;
  contact_phone: string;
  contact_person: string;
  created_at: string;
  owner_email?: string;
  owner_id?: string;
}

export interface BusinessDetails {
  tenant: {
    id: string;
    name: string;
    business_type: string;
    contact_email: string;
    contact_phone: string;
    contact_person: string;
    logo_url?: string;
    background_image_url?: string;
    stamp_icon_url?: string;
    status: string;
    onboarding_completed: boolean;
    created_at: string;
  };
  location?: {
    id: string;
    name: string;
    address: string;
    scan_code: string;
  };
  loyaltyProgram?: {
    id: string;
    stamps_required: number;
    reward_description: string;
  };
  billingInfo?: {
    company_name?: string;
    nip?: string;
    street_address?: string;
    city?: string;
    postal_code?: string;
  };
  owner?: {
    email: string;
    id: string;
  };
}

export class ApprovalRepository {
  /**
   * Get all pending businesses
   */
  async getPendingBusinesses(): Promise<PendingBusiness[]> {
    try {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending businesses:', error);
        return [];
      }

      // Get owner info for each tenant
      const businessesWithOwners = await Promise.all(
        (tenants || []).map(async (tenant) => {
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('tenant_id', tenant.id)
            .eq('role', 'business_owner')
            .single();

          if (userRole) {
            const { data: { user } } = await supabase.auth.admin.getUserById(userRole.user_id);
            return {
              ...tenant,
              owner_email: user?.email,
              owner_id: user?.id
            };
          }

          return tenant;
        })
      );

      return businessesWithOwners;
    } catch (error) {
      console.error('Error in getPendingBusinesses:', error);
      return [];
    }
  }

  /**
   * Get complete business details
   */
  async getBusinessDetails(tenantId: string): Promise<BusinessDetails | null> {
    try {
      // Get tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();

      if (tenantError || !tenant) {
        console.error('Error fetching tenant:', tenantError);
        return null;
      }

      // Get location
      const { data: location } = await supabase
        .from('locations')
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(1)
        .single();

      // Get loyalty program
      const { data: loyaltyProgram } = await supabase
        .from('loyalty_programs')
        .select('*')
        .eq('tenant_id', tenantId)
        .limit(1)
        .single();

      // Get billing info
      const { data: billingInfo } = await supabase
        .from('tenant_billing_info')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      // Get owner
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('tenant_id', tenantId)
        .eq('role', 'business_owner')
        .single();

      let owner;
      if (userRole) {
        const { data: { user } } = await supabase.auth.admin.getUserById(userRole.user_id);
        owner = user ? { email: user.email || '', id: user.id } : undefined;
      }

      return {
        tenant,
        location: location || undefined,
        loyaltyProgram: loyaltyProgram || undefined,
        billingInfo: billingInfo || undefined,
        owner
      };
    } catch (error) {
      console.error('Error in getBusinessDetails:', error);
      return null;
    }
  }

  /**
   * Approve business
   */
  async approveBusiness(tenantId: string, approvedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'active',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) {
        console.error('Error approving business:', error);
        return { success: false, error: 'Nie udało się zatwierdzić biznesu' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in approveBusiness:', error);
      return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
    }
  }

  /**
   * Reject business
   */
  async rejectBusiness(tenantId: string, reason: string, rejectedBy: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          approved_by: rejectedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', tenantId);

      if (error) {
        console.error('Error rejecting business:', error);
        return { success: false, error: 'Nie udało się odrzucić biznesu' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in rejectBusiness:', error);
      return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
    }
  }

  /**
   * Get billing info for a tenant
   */
  async getBillingInfo(tenantId: string) {
    const { data, error } = await supabase
      .from('tenant_billing_info')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (error) {
      console.error('Error fetching billing info:', error);
      return null;
    }

    return data;
  }
}

