import { supabase } from './supabase.client';
import { generateScanCode } from '../utils/scanCodeGenerator';
import { compressAndResizeImage } from '../utils/imageOptimization';

export interface CreateBusinessData {
  // Tenant
  businessName: string;
  businessType: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  
  // Location
  locationName: string;
  locationAddress: string;
  
  // Billing (optional)
  companyName?: string;
  nip?: string;
  streetAddress?: string;
  city?: string;
  postalCode?: string;
  
  // Images (optional)
  backgroundImage?: File;
  logo?: File;
  stampIcon?: File;
  
  // Loyalty Program
  stampsRequired: number;
  rewardDescription: string;
  
  // User
  userId: string;
}

export class OnboardingRepository {
  /**
   * Create complete business with owner, location, and loyalty program
   */
  async createBusinessWithOwner(data: CreateBusinessData): Promise<{ success: boolean; tenantId?: string; error?: string }> {
    try {
      // 1. Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          name: data.businessName,
          business_type: data.businessType,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          contact_person: data.contactPerson,
          status: 'pending'
        })
        .select()
        .single();

      if (tenantError || !tenant) {
        console.error('Error creating tenant:', tenantError);
        return { success: false, error: 'Nie udało się utworzyć biznesu' };
      }

      const tenantId = tenant.id;

      // 2. Update user role to business_owner with tenant_id
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: data.userId,
          role: 'business_owner',
          tenant_id: tenantId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        console.error('Error updating user role:', roleError);
        return { success: false, error: 'Nie udało się zaktualizować roli użytkownika' };
      }

      // 3. Generate scan code and create location
      const scanCode = generateScanCode(data.businessName, data.locationName);
      
      const { error: locationError } = await supabase
        .from('locations')
        .insert({
          tenant_id: tenantId,
          name: data.locationName,
          address: data.locationAddress,
          scan_code: scanCode
        });

      if (locationError) {
        console.error('Error creating location:', locationError);
        return { success: false, error: 'Nie udało się utworzyć lokalizacji' };
      }

      // 4. Create loyalty program
      const { error: programError } = await supabase
        .from('loyalty_programs')
        .insert({
          tenant_id: tenantId,
          stamps_required: data.stampsRequired,
          reward_description: data.rewardDescription,
          active: true
        });

      if (programError) {
        console.error('Error creating loyalty program:', programError);
        return { success: false, error: 'Nie udało się utworzyć programu lojalnościowego' };
      }

      // 5. Create billing info if provided
      if (data.nip || data.companyName) {
        const { error: billingError } = await supabase
          .from('tenant_billing_info')
          .insert({
            tenant_id: tenantId,
            company_name: data.companyName,
            nip: data.nip,
            street_address: data.streetAddress,
            city: data.city,
            postal_code: data.postalCode
          });

        if (billingError) {
          console.error('Error creating billing info:', billingError);
          // Don't fail - billing is optional
        }
      }

      // 6. Upload images if provided
      if (data.backgroundImage) {
        await this.uploadImage(data.backgroundImage, tenantId, 'background');
      }
      if (data.logo) {
        await this.uploadImage(data.logo, tenantId, 'logo');
      }
      if (data.stampIcon) {
        await this.uploadImage(data.stampIcon, tenantId, 'stamp');
      }

      return { success: true, tenantId };
    } catch (error) {
      console.error('Error in createBusinessWithOwner:', error);
      return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
    }
  }

  /**
   * Upload image to Supabase Storage and update tenant
   */
  async uploadImage(file: File, tenantId: string, type: 'background' | 'logo' | 'stamp'): Promise<string | null> {
    try {
      // Compress and resize based on type
      let maxWidth = 1920;
      let maxHeight = 1080;
      
      if (type === 'logo') {
        maxWidth = 500;
        maxHeight = 500;
      } else if (type === 'stamp') {
        maxWidth = 200;
        maxHeight = 200;
      }

      const compressed = await compressAndResizeImage(file, maxWidth, maxHeight);
      
      // Generate file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}.${fileExt}`;
      const filePath = `tenants/${tenantId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('loyalty-images')
        .upload(filePath, compressed, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('loyalty-images')
        .getPublicUrl(filePath);

      // Update tenant with image URL
      const columnName = type === 'background' 
        ? 'background_image_url' 
        : type === 'logo' 
        ? 'logo_url' 
        : 'stamp_icon_url';

      await supabase
        .from('tenants')
        .update({ [columnName]: publicUrl })
        .eq('id', tenantId);

      return publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return null;
    }
  }

  /**
   * Check if NIP already exists
   */
  async checkNIPDuplicate(nip: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('tenant_billing_info')
      .select('id')
      .eq('nip', nip)
      .single();

    return !!data && !error;
  }

  /**
   * Check if business name is similar to existing ones
   */
  async checkBusinessNameDuplicate(name: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('tenants')
      .select('name')
      .ilike('name', `%${name}%`);

    if (error || !data) {
      return [];
    }

    return data.map(t => t.name);
  }
}

