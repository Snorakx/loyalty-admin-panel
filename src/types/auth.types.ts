export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  BUSINESS_OWNER = 'business_owner',
  MANAGER = 'manager',
  VIEWER = 'viewer'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant_id?: string; // For business owners/managers
  created_at: string;
  updated_at: string;
}

export interface UserPermissions {
  canViewAllTenants: boolean;
  canCreateTenants: boolean;
  canEditTenants: boolean;
  canDeleteTenants: boolean;
  canViewAllLocations: boolean;
  canCreateLocations: boolean;
  canEditLocations: boolean;
  canDeleteLocations: boolean;
  canViewAllLoyaltyPrograms: boolean;
  canCreateLoyaltyPrograms: boolean;
  canEditLoyaltyPrograms: boolean;
  canDeleteLoyaltyPrograms: boolean;
  canViewUsers: boolean;
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
}

export const getPermissionsForRole = (role: UserRole): UserPermissions => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return {
        canViewAllTenants: true,
        canCreateTenants: true,
        canEditTenants: true,
        canDeleteTenants: true,
        canViewAllLocations: true,
        canCreateLocations: true,
        canEditLocations: true,
        canDeleteLocations: true,
        canViewAllLoyaltyPrograms: true,
        canCreateLoyaltyPrograms: true,
        canEditLoyaltyPrograms: true,
        canDeleteLoyaltyPrograms: true,
        canViewUsers: true,
        canCreateUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
      };
    
    case UserRole.BUSINESS_OWNER:
      return {
        canViewAllTenants: false,
        canCreateTenants: false,
        canEditTenants: true, // Only own tenants
        canDeleteTenants: false,
        canViewAllLocations: false,
        canCreateLocations: true, // Only for own tenants
        canEditLocations: true, // Only for own tenants
        canDeleteLocations: true, // Only for own tenants
        canViewAllLoyaltyPrograms: false,
        canCreateLoyaltyPrograms: true, // Only for own tenants
        canEditLoyaltyPrograms: true, // Only for own tenants
        canDeleteLoyaltyPrograms: true, // Only for own tenants
        canViewUsers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
      };
    
    case UserRole.MANAGER:
      return {
        canViewAllTenants: false,
        canCreateTenants: false,
        canEditTenants: false,
        canDeleteTenants: false,
        canViewAllLocations: false,
        canCreateLocations: true, // Only for assigned tenants
        canEditLocations: true, // Only for assigned tenants
        canDeleteLocations: false,
        canViewAllLoyaltyPrograms: false,
        canCreateLoyaltyPrograms: false,
        canEditLoyaltyPrograms: false,
        canDeleteLoyaltyPrograms: false,
        canViewUsers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
      };
    
    case UserRole.VIEWER:
      return {
        canViewAllTenants: false,
        canCreateTenants: false,
        canEditTenants: false,
        canDeleteTenants: false,
        canViewAllLocations: false,
        canCreateLocations: false,
        canEditLocations: false,
        canDeleteLocations: false,
        canViewAllLoyaltyPrograms: false,
        canCreateLoyaltyPrograms: false,
        canEditLoyaltyPrograms: false,
        canDeleteLoyaltyPrograms: false,
        canViewUsers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
      };
    
    default:
      return {
        canViewAllTenants: false,
        canCreateTenants: false,
        canEditTenants: false,
        canDeleteTenants: false,
        canViewAllLocations: false,
        canCreateLocations: false,
        canEditLocations: false,
        canDeleteLocations: false,
        canViewAllLoyaltyPrograms: false,
        canCreateLoyaltyPrograms: false,
        canEditLoyaltyPrograms: false,
        canDeleteLoyaltyPrograms: false,
        canViewUsers: false,
        canCreateUsers: false,
        canEditUsers: false,
        canDeleteUsers: false,
      };
  }
};
