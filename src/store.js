import { create } from 'zustand';

export const useStore = create((set) => ({
  file: null,
  setFile: (file) => set({ file }),
}));