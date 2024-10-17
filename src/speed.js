import { create } from 'zustand';

const useSpeedStore = create((set) => ({
  speed: 1,
  setSpeed: (newSpeed) => set({ speed: newSpeed }),
}));

export const useSpeed = () => {
  const { speed, setSpeed } = useSpeedStore();
  return { speed, setSpeed };
};

export const applySpeedToSource = (source, speed) => {
  source.playbackRate.setValueAtTime(speed, source.context.currentTime);
};