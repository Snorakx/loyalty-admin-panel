import { UserRepository } from '../repositories/user.repository';
import { User, UserRole, UserPermissions, getPermissionsForRole } from '../types/auth.types';
import { supabase } from '../repositories/supabase.client';
import { createLogger } from '../utils/logger';

export class AuthService {
  private userRepository: UserRepository;
  private logger = createLogger('AuthService');
  private userCache: User | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds
  
  // Current user state
  private _currentUser: User | null = null;
  private _isAuthenticated: boolean = false;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // Singleton instance
  private static instance: AuthService | null = null;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(email: string, password: string): Promise<User | null> {
    this.logger.info('Login attempt started', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        this.logger.error('Login failed - authentication error', error);
        throw new Error(error?.message || 'Błąd logowania');
      }

      this.logger.info('Authentication successful, fetching user data...');
      const user = await this.userRepository.getCurrentUser();
      
      if (!user) {
        this.logger.error('Login failed - user has no role assigned');
        throw new Error('Twoje konto nie ma przypisanej roli. Skontaktuj się z administratorem.');
      }

      this.logger.success('Login successful', { userId: user.id, role: user.role });
      this.setUser(user);
      return user;
    } catch (error) {
      this.logger.error('Login error', error);
      throw error;
    }
  }

  async checkAuth(): Promise<User | null> {
    this.logger.debug('Checking authentication status...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        this.logger.info('No active session found');
        return null;
      }

      this.logger.debug('Session found, fetching user data...');
      const user = await this.userRepository.getCurrentUser();
      
      if (user) {
        this.logger.info('User authenticated', { userId: user.id, role: user.role });
        this.setUser(user);
      } else {
        this.logger.warn('Session exists but no user data found');
        this.setUser(null);
      }
      
      return user;
    } catch (error) {
      this.logger.error('Check auth error', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    this.logger.info('Logging out...');
    await supabase.auth.signOut();
    // Clear cache and state on logout
    this.userCache = null;
    this.cacheTimestamp = 0;
    this.setUser(null);
    this.logger.success('Logout successful');
  }

  // Get current user from state (no API call)
  getCurrentUser(): User | null {
    return this._currentUser;
  }

  // Get authentication status
  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  // Set user state (internal method)
  private setUser(user: User | null): void {
    this._currentUser = user;
    this._isAuthenticated = !!user;
    this.logger.debug('User state updated', { 
      isAuthenticated: this._isAuthenticated,
      userId: user?.id 
    });
  }

  // Fetch user from API and update state
  async fetchCurrentUser(): Promise<User | null> {
    // Check cache first
    if (this.userCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      this.logger.debug('Using cached user data');
      this.setUser(this.userCache);
      return this.userCache;
    }

    this.logger.debug('Fetching user from repository...');
    const user = await this.userRepository.getCurrentUser();
    
    // Cache the result
    this.userCache = user;
    this.cacheTimestamp = Date.now();
    
    // Update state
    this.setUser(user);
    
    return user;
  }

  async getUserPermissions(): Promise<UserPermissions | null> {
    const user = await this.getCurrentUser();
    if (!user) {
      return null;
    }

    return getPermissionsForRole(user.role);
  }

  async canAccessTenant(tenantId: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) {
      return false;
    }

    const permissions = getPermissionsForRole(user.role);

    if (permissions.canViewAllTenants) {
      return true;
    }

    if (user.role === UserRole.BUSINESS_OWNER && user.tenant_id === tenantId) {
      return true;
    }

    if (user.role === UserRole.MANAGER && user.tenant_id === tenantId) {
      return true;
    }

    return false;
  }

  async canManageTenant(tenantId: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) {
      return false;
    }

    const permissions = getPermissionsForRole(user.role);

    if (permissions.canEditTenants) {
      return true;
    }

    if (user.role === UserRole.BUSINESS_OWNER && user.tenant_id === tenantId) {
      return true;
    }

    return false;
  }

  async canCreateTenant(): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions?.canCreateTenants || false;
  }

  async canViewAllTenants(): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions?.canViewAllTenants || false;
  }

  async canManageUsers(): Promise<boolean> {
    const permissions = await this.getUserPermissions();
    return permissions?.canViewUsers || false;
  }

  async isSuperAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === UserRole.SUPER_ADMIN;
  }

  async isBusinessOwner(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === UserRole.BUSINESS_OWNER;
  }

  async getUserTenantId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.tenant_id || null;
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    this.logger.debug('Verifying password for user', { email });
    
    try {
      // Próbujemy zalogować się z podanymi danymi
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.warn('Password verification failed', { error: error.message });
        return false;
      }

      this.logger.debug('Password verification successful');
      return true;
    } catch (error) {
      this.logger.error('Password verification error', error);
      return false;
    }
  }
}