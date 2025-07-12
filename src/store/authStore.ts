
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      
      login: async (email: string, password: string) => {
        // Dummy login - accept any email/password combo
        if (email && password) {
          const user = {
            id: '1',
            name: email.split('@')[0] || 'User',
            email: email
          };
          set({ user, isLoggedIn: true });
          return true;
        }
        return false;
      },
      
      logout: () => {
        set({ user: null, isLoggedIn: false });
      }
    }),
    {
      name: 'auth-store'
    }
  )
);
