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
  // Expand the volume range: 0 to 5 (0% to 500%)
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  source.connect(gainNode);
  return [gainNode];
};