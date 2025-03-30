// src/store/useStore.js
import { create } from 'zustand';

const useStore = create((set) => ({
  user: null,
  history: [],
  favoriteLanguages: [],
  setUser: (user) => set({ user }),
  addToHistory: (entry) => set((state) => ({ history: [...state.history, entry] })),
  setFavoriteLanguages: (langs) => set({ favoriteLanguages: langs }),
}));

export default useStore;