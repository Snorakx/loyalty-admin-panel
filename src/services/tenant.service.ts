import { TenantRepository, Tenant, Location, LoyaltyProgram } from '../repositories/tenant.repository';
import { AuthService } from './auth.service';
import { createLogger } from '../utils/logger';

export class TenantService {
  private tenantRepository: TenantRepository;
  private authService: AuthService;
  private logger = createLogger('TenantService');
  
  // Cache for dashboard data
  private dashboardCache: {
    tenants: Tenant[];
    locations: Location[];
    loyaltyPrograms: LoyaltyProgram[];
    stats: any;
  } | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // Singleton instance
  private static instance: TenantService | null = null;
  
  static getInstance(): TenantService {
    if (!TenantService.instance) {
      TenantService.instance = new TenantService();
    }
    return TenantService.instance;
  }

  constructor() {
    this.tenantRepository = new TenantRepository();
    this.authService = AuthService.getInstance(); // Use singleton
  }

  async getTenants(user?: User): Promise<Tenant[]> {
    const currentUser = user || this.authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    // Super admin can see all tenants
    if (currentUser.role === 'super_admin') {
      return await this.tenantRepository.getTenants();
    }

    // Business owners and managers can only see their assigned tenant
    if (currentUser.tenant_id) {
      const tenant = await this.tenantRepository.getTenant(currentUser.tenant_id);
      return tenant ? [tenant] : [];
    }

    return [];
  }

  async getTenant(tenantId: string): Promise<Tenant | null> {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      return null;
    }

    // Super admin can access any tenant
    if (user.role === 'super_admin') {
      return await this.tenantRepository.getTenant(tenantId);
    }

    // Business owners and managers can only access their assigned tenant
    if (user.tenant_id === tenantId) {
      return await this.tenantRepository.getTenant(tenantId);
    }

    return null;
  }

  async getLocations(tenantId?: string, user?: User): Promise<Location[]> {
    const currentUser = user || this.authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }

    // Super admin can see all locations
    if (currentUser.role === 'super_admin') {
      return await this.tenantRepository.getLocations(tenantId);
    }

    // Business owners and managers can only see locations of their assigned tenant
    if (currentUser.tenant_id) {
      return await this.tenantRepository.getLocations(currentUser.tenant_id);
    }

    return [];
  }

  async getLoyaltyPrograms(tenantId?: string): Promise<LoyaltyProgram[]> {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return [];
    }

    // Super admin can see all loyalty programs
    if (user.role === 'super_admin') {
      return await this.tenantRepository.getLoyaltyPrograms(tenantId);
    }

    // Business owners and managers can only see loyalty programs of their assigned tenant
    if (user.tenant_id) {
      return await this.tenantRepository.getLoyaltyPrograms(user.tenant_id);
    }

    return [];
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'created_at'>): Promise<Tenant | null> {
    return await this.tenantRepository.createTenant(tenantData);
  }

  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    return await this.tenantRepository.updateTenant(tenantId, updates);
  }

  async deleteTenant(tenantId: string): Promise<boolean> {
    return await this.tenantRepository.deleteTenant(tenantId);
  }

  // Get all dashboard data in one call (cached)
  async getDashboardData() {
    this.logger.debug('Fetching dashboard data...');
    
    // Check cache first
    if (this.dashboardCache && Date.now() - this.cacheTimestamp < this.CACHE_DURATION) {
      this.logger.debug('Using cached dashboard data');
      return this.dashboardCache;
    }
    
    try {
      // Get user from state (no API call)
      const user = this.authService.getCurrentUser();
      if (!user) {
        const emptyData = {
          tenants: [],
          locations: [],
          loyaltyPrograms: [],
          stats: {
            totalTenants: 0,
            totalLocations: 0,
            totalLoyaltyPrograms: 0,
            activePrograms: 0
          }
        };
        this.dashboardCache = emptyData;
        this.cacheTimestamp = Date.now();
        return emptyData;
      }

      // Fetch all data in parallel
      const [tenants, locations, loyaltyPrograms] = await Promise.all([
        this.getTenants(user),
        this.getLocations(undefined, user),
        this.getLoyaltyPrograms()
      ]);

      const stats = {
        totalTenants: tenants.length,
        totalLocations: locations.length,
        totalLoyaltyPrograms: loyaltyPrograms.length,
        activePrograms: loyaltyPrograms.filter(p => p.active).length
      };

      const dashboardData = {
        tenants,
        locations,
        loyaltyPrograms,
        stats
      };

      // Cache the result
      this.dashboardCache = dashboardData;
      this.cacheTimestamp = Date.now();

      this.logger.success('Dashboard data fetched', stats);
      return dashboardData;
    } catch (error) {
      this.logger.error('Error fetching dashboard data', error);
      const emptyData = {
        tenants: [],
        locations: [],
        loyaltyPrograms: [],
        stats: {
          totalTenants: 0,
          totalLocations: 0,
          totalLoyaltyPrograms: 0,
          activePrograms: 0
        }
      };
      this.dashboardCache = emptyData;
      this.cacheTimestamp = Date.now();
      return emptyData;
    }
  }

  // Dashboard statistics (for backward compatibility)
  async getDashboardStats() {
    const dashboardData = await this.getDashboardData();
    return dashboardData.stats;
  }
}
