import { create } from 'zustand';

const usePitchStore = create((set) => ({
  pitch: 0,
  setPitch: (newPitch) => set({ pitch: newPitch }),
}));

export const usePitch = () => {
  const { pitch, setPitch } = usePitchStore();
  return { pitch, setPitch };
};

export const applyPitchToSource = (source, pitch) => {
  // Convert semitones to cents (100 cents per semitone)
  const cents = pitch * 100;
  source.detune.value = cents;
};