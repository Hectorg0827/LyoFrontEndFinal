import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  avatar: string;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  setUser: (user: User | null) => void;
  setAuthenticated: (status: boolean) => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isDarkMode: true,
  setUser: (user) => set({ user }),
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
