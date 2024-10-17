import { applyPitchToSource } from './pitch';
import { applyReverbToSource } from './reverb';

export const createAudioSource = (audioContext, audioBuffer) => {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  return source;
};

export const applyAudioProcessing = (audioContext, source, processingFunctions) => {
  let currentNode = source;
  processingFunctions.forEach(func => {
    const [newNode, ...additionalNodes] = func(audioContext, currentNode);
    currentNode = newNode || currentNode;
  });
  return currentNode;
};

export const processEntireAudio = async (audioBuffer, processingFunctions) => {
  const offlineAudioContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );
  
  const source = createAudioSource(offlineAudioContext, audioBuffer);
  const processedSource = applyAudioProcessing(offlineAudioContext, source, processingFunctions);
  
  processedSource.connect(offlineAudioContext.destination);
  source.start();
  
  return await offlineAudioContext.startRendering();
};

export const audioBufferToWav = (buffer) => {
  const wav = require('audiobuffer-to-wav');
  const wavArrayBuffer = wav(buffer);
  return new Blob([wavArrayBuffer], { type: 'audio/wav' });
};