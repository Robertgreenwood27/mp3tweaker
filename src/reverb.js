import { create } from 'zustand';

const useReverbStore = create((set) => ({
  reverb: 0,
  setReverb: (newReverb) => set({ reverb: newReverb }),
}));

export const useReverb = () => {
  const { reverb, setReverb } = useReverbStore();
  return { reverb, setReverb };
};

export const applyReverbToSource = async (audioContext, source, reverbLevel) => {
  const convolver = audioContext.createConvolver();
  const dry = audioContext.createGain();
  const wet = audioContext.createGain();
  
  // Create impulse response
  const impulseResponse = await createImpulseResponse(audioContext);
  convolver.buffer = impulseResponse;

  // Connect the graph
  source.connect(dry);
  source.connect(convolver);
  convolver.connect(wet);

  // Set levels
  dry.gain.setValueAtTime(1 - reverbLevel, audioContext.currentTime);
  wet.gain.setValueAtTime(reverbLevel, audioContext.currentTime);

  return [dry, wet];
};

const createImpulseResponse = async (audioContext) => {
  const sampleRate = audioContext.sampleRate;
  const length = 2 * sampleRate; // 2 seconds
  const impulseResponse = audioContext.createBuffer(2, length, sampleRate);
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = impulseResponse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
    }
  }
  
  return impulseResponse;
};