import { supabase } from './supabase.client';
import { User, UserRole } from '../types/auth.types';
import { createLogger } from '../utils/logger';

export class UserRepository {
  private logger = createLogger('UserRepository');

  async getCurrentUser(): Promise<User | null> {
    this.logger.debug('Fetching current user...');
    
    try {
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      
      if (getUserError) {
        this.logger.error('Failed to get auth user', getUserError);
        return null;
      }

      if (!user) {
        this.logger.debug('No authenticated user found');
        return null;
      }

      this.logger.debug('Auth user found, fetching role...', { userId: user.id });

      const { data: userRole, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        this.logger.error('Failed to fetch user role', error);
        return null;
      }

      if (!userRole) {
        this.logger.warn('User has no role assigned', { userId: user.id });
        return null;
      }

      this.logger.success('User data fetched successfully', { 
        userId: user.id, 
        role: userRole.role 
      });

      return {
        id: user.id,
        email: user.email || '',
        role: userRole.role as UserRole,
        tenant_id: userRole.tenant_id,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      };
    } catch (error) {
      this.logger.error('Error getting current user', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          auth_users:user_id (
            id,
            email,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }
      
      return data?.map(item => ({
        id: item.user_id,
        email: item.auth_users?.email || '',
        role: item.role as UserRole,
        tenant_id: item.tenant_id,
        created_at: item.auth_users?.created_at || item.created_at,
        updated_at: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, role: UserRole, tenantId?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          tenant_id: tenantId,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async createUser(email: string, password: string, role: UserRole, tenantId?: string): Promise<User | null> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        return null;
      }

      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: role,
          tenant_id: tenantId
        });

      if (roleError) {
        console.error('Error creating user role:', roleError);
        return null;
      }

      return {
        id: authData.user.id,
        email: authData.user.email || '',
        role: role,
        tenant_id: tenantId,
        created_at: authData.user.created_at,
        updated_at: authData.user.updated_at || authData.user.created_at
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete user role first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error deleting user role:', roleError);
        return false;
      }

      // Note: We can't delete auth users from client side
      // This should be done from Supabase dashboard or with service role
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }
}
