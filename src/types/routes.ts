import { type Role } from '../interfaces/users.interface';

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  roles: Role[];
  title: string;
  icon?: React.ComponentType;
  showInNav?: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType;
  roles: Role[];
}

export const APP_ROUTES = {
  // Public routes
  AUTH: '/auth',
  RESET_PASSWORD: '/reset-password',
  
  // Private routes
  DASHBOARD: '/dashboard',
  PATIENTS: '/patients',
  USERS: '/users',
  MEDICAL_RECORDS: '/medical-records',
  SALES: '/sales', 
  INVENTORY: '/inventory',
  CASH_CLOSE: '/cash-close',
  EMPLOYEES: '/employees',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  MY_SALES: '/my-sales',
  FIREBASE_TEST: '/firebase-test',
} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];