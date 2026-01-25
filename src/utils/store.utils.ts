// Utility functions for async operations and error handling

export const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

export const generateId = (): string => 
  Date.now().toString() + Math.random().toString(36).substring(2, 9);

export const getCurrentTimestamp = (): number => Date.now();

// Generic error handler for store operations
export class StoreError extends Error {
  public code?: string;
  public details?: unknown;

  constructor(
    message: string,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'StoreError';
    this.code = code;
    this.details = details;
  }
}

// Async operation wrapper with error handling
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new StoreError(
      errorMessage,
      error instanceof Error ? error.name : 'UNKNOWN_ERROR',
      error
    );
  }
};

// Generic async store action wrapper
export const createAsyncAction = <T extends unknown[], R>(
  action: (...args: T) => Promise<R>,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  return async (...args: T): Promise<R> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await action(...args);
      return result;
    } catch (error) {
      const errorMessage = error instanceof StoreError 
        ? error.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };
};

// Search utility functions
export const createSearchFilter = <T>(
  searchFields: (keyof T)[],
  caseSensitive: boolean = false
) => {
  return (items: T[], searchTerm: string): T[] => {
    if (!searchTerm.trim()) return items;
    
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
    
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          const searchValue = caseSensitive ? value : value.toLowerCase();
          return searchValue.includes(term);
        }
        return false;
      })
    );
  };
};

// Debounce utility for search
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};