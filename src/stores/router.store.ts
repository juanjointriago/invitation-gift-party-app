import { create } from 'zustand';

export type Route = 
  | 'dashboard' 
  | 'patients' 
  | 'medical-records' 
  | 'sales' 
  | 'inventory' 
  | 'cash-close' 
  | 'employees' 
  | 'reports' 
  | 'settings'
  | 'my-sales'
  | 'profile';

interface RouterState {
  currentRoute: Route;
  previousRoute: Route | null;
  
  // Actions
  navigate: (route: Route) => void;
  goBack: () => void;
}

export const useRouterStore = create<RouterState>((set, get) => ({
  currentRoute: 'dashboard',
  previousRoute: null,

  navigate: (route: Route) => {
    const { currentRoute } = get();
    set({ 
      previousRoute: currentRoute,
      currentRoute: route 
    });
  },

  goBack: () => {
    const { previousRoute } = get();
    if (previousRoute) {
      set({ 
        currentRoute: previousRoute,
        previousRoute: null 
      });
    }
  },
}));