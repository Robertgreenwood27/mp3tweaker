import { create } from 'zustand';

const useReverbStore = create((set) => ({
  reverbAmount: 0,
  setReverbAmount: (newAmount) => set({ reverbAmount: newAmount }),
}));

export const useReverb = () => {
  const { reverbAmount, setReverbAmount } = useReverbStore();
  return { reverbAmount, setReverbAmount };
};

export const applyReverbToSource = (audioContext, source, reverbAmount) => {
  const convolver = audioContext.createConvolver();
  const wetGain = audioContext.createGain();
  const dryGain = audioContext.createGain();

  // Create impulse response
  const impulseLength = 2 * audioContext.sampleRate;
  const impulse = audioContext.createBuffer(2, impulseLength, audioContext.sampleRate);
  const impulseL = impulse.getChannelData(0);
  const impulseR = impulse.getChannelData(1);

  for (let i = 0; i < impulseLength; i++) {
    const decay = Math.exp(-i / (audioContext.sampleRate * (reverbAmount * 2 + 0.1)));
    impulseL[i] = (Math.random() * 2 - 1) * decay;
    impulseR[i] = (Math.random() * 2 - 1) * decay;
  }

  convolver.buffer = impulse;

  // Connect nodes
  source.connect(dryGain);
  source.connect(convolver);
  convolver.connect(wetGain);

  const outputGain = audioContext.createGain();
  dryGain.connect(outputGain);
  wetGain.connect(outputGain);

  // Set gain values
  const wetAmount = reverbAmount;
  wetGain.gain.setValueAtTime(wetAmount, audioContext.currentTime);
  dryGain.gain.setValueAtTime(1 - wetAmount, audioContext.currentTime);

  return [outputGain, dryGain, wetGain, convolver];
};