import { create } from 'zustand';

const useVolumeStore = create((set) => ({
  volume: 1,
  setVolume: (newVolume) => set({ volume: newVolume }),
}));

export const useVolume = () => {
  const { volume, setVolume } = useVolumeStore();
  return { volume, setVolume };
};

export const applyVolumeToSource = (audioContext, source, volume) => {
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  source.connect(gainNode);
  return gainNode;
};