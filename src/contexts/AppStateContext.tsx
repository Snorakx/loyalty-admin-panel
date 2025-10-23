import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('AppStateContext');

// Types
export interface User {
  id: string;
  email: string;
  tenant_id?: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  business_type: string;
  logo_url?: string;
  stamp_icon_url?: string;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  created_at: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalStamps: number;
  activeCards: number;
  engagement: number;
  customersTrend: number;
  stampsTrend: number;
  cardsTrend: number;
  engagementTrend: number;
}

export interface PendingBusiness {
  id: string;
  name: string;
  business_type: string;
  owner_email?: string;
  created_at: string;
}

export interface BusinessDetails {
  id: string;
  name: string;
  business_type: string;
  owner_email?: string;
  created_at: string;
  tenant: Tenant;
}

// State interface
export interface AppState {
  // User state
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Tenant state
  currentTenant: Tenant | null;
  locations: Location[];
  
  // Dashboard state
  dashboardStats: DashboardStats | null;
  
  // Pending businesses state
  pendingBusinesses: PendingBusiness[];
  
  // Business details state
  businessDetails: BusinessDetails | null;
  
  // Loading states
  loading: {
    user: boolean;
    tenant: boolean;
    locations: boolean;
    dashboard: boolean;
    pendingBusinesses: boolean;
    businessDetails: boolean;
  };
  
  // Error states
  errors: {
    user: string | null;
    tenant: string | null;
    locations: string | null;
    dashboard: string | null;
    pendingBusinesses: string | null;
    businessDetails: string | null;
  };
  
  // Cache timestamps
  cacheTimestamps: {
    user: number | null;
    tenant: number | null;
    locations: number | null;
    dashboard: number | null;
    pendingBusinesses: number | null;
    businessDetails: number | null;
  };
}

// Action types
export type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_TENANT'; payload: Tenant | null }
  | { type: 'SET_LOCATIONS'; payload: Location[] }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats | null }
  | { type: 'SET_PENDING_BUSINESSES'; payload: PendingBusiness[] }
  | { type: 'SET_BUSINESS_DETAILS'; payload: BusinessDetails | null }
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; value: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['errors']; value: string | null } }
  | { type: 'UPDATE_CACHE_TIMESTAMP'; payload: { key: keyof AppState['cacheTimestamps']; value: number } }
  | { type: 'CLEAR_CACHE' }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  currentTenant: null,
  locations: [],
  dashboardStats: null,
  pendingBusinesses: [],
  businessDetails: null,
  loading: {
    user: false,
    tenant: false,
    locations: false,
    dashboard: false,
    pendingBusinesses: false,
    businessDetails: false,
  },
  errors: {
    user: null,
    tenant: null,
    locations: null,
    dashboard: null,
    pendingBusinesses: null,
    businessDetails: null,
  },
  cacheTimestamps: {
    user: null,
    tenant: null,
    locations: null,
    dashboard: null,
    pendingBusinesses: null,
    businessDetails: null,
  },
};

// Reducer
function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        isAuthenticated: !!action.payload,
      };
    
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    
    case 'SET_TENANT':
      return {
        ...state,
        currentTenant: action.payload,
      };
    
    case 'SET_LOCATIONS':
      return {
        ...state,
        locations: action.payload,
      };
    
    case 'SET_DASHBOARD_STATS':
      return {
        ...state,
        dashboardStats: action.payload,
      };
    
    case 'SET_PENDING_BUSINESSES':
      return {
        ...state,
        pendingBusinesses: action.payload,
      };
    
    case 'SET_BUSINESS_DETAILS':
      return {
        ...state,
        businessDetails: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'UPDATE_CACHE_TIMESTAMP':
      return {
        ...state,
        cacheTimestamps: {
          ...state.cacheTimestamps,
          [action.payload.key]: action.payload.value,
        },
      };
    
    case 'CLEAR_CACHE':
      return {
        ...state,
        cacheTimestamps: {
          user: null,
          tenant: null,
          locations: null,
          dashboard: null,
          pendingBusinesses: null,
          businessDetails: null,
        },
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Cache utilities
export const CACHE_DURATION = {
  user: 5 * 60 * 1000, // 5 minutes
  tenant: 10 * 60 * 1000, // 10 minutes
  locations: 5 * 60 * 1000, // 5 minutes
  dashboard: 2 * 60 * 1000, // 2 minutes
  pendingBusinesses: 1 * 60 * 1000, // 1 minute
  businessDetails: 5 * 60 * 1000, // 5 minutes
};

export const isCacheValid = (timestamp: number | null, cacheKey: keyof typeof CACHE_DURATION): boolean => {
  if (!timestamp) return false;
  const now = Date.now();
  const cacheAge = now - timestamp;
  return cacheAge < CACHE_DURATION[cacheKey];
};

// Helper functions
export const useCache = () => {
  const { state, dispatch } = useAppState();
  
  const getCachedData = <T,>(key: keyof AppState, cacheKey: keyof typeof CACHE_DURATION): T | null => {
    const data = state[key] as T;
    const timestamp = state.cacheTimestamps[cacheKey];
    
    if (data && isCacheValid(timestamp, cacheKey)) {
      logger.debug(`Using cached data for ${cacheKey}`);
      return data;
    }
    
    return null;
  };
  
  const setCachedData = <T,>(key: keyof AppState, cacheKey: keyof typeof CACHE_DURATION, data: T) => {
    dispatch({ type: `SET_${key.toString().toUpperCase()}` as any, payload: data });
    dispatch({ type: 'UPDATE_CACHE_TIMESTAMP', payload: { key: cacheKey, value: Date.now() } });
  };
  
  return { getCachedData, setCachedData };
};
