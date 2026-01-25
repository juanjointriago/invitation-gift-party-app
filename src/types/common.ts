// Common types for the application
export interface BaseEntity {
  id: string;
  createdAt?: number;
  updatedAt?: number;
  isActive: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

export interface SearchableState {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

// Generic store actions
export interface BaseStoreActions<T extends BaseEntity> {
  fetch: () => Promise<void>;
  add: (item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Store state interface
export interface BaseStoreState<T extends BaseEntity> extends LoadingState {
  items: T[];
  selectedItem: T | null;
  setSelectedItem: (item: T | null) => void;
}