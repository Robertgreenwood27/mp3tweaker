import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { usePitch, applyPitchToSource } from '../pitch';
import { useReverb, applyReverbToSource } from '../reverb';
import { useVolume, applyVolumeToSource } from '../volume';
import { createAudioSource, applyAudioProcessing, processEntireAudio, audioBufferToWav } from '../audioProcessing';
import WaveformVisualizer from './WaveformVisualizer';

export default function TweakedAudio() {
  const { file } = useStore();
  const { pitch } = usePitch();
  const { reverbAmount } = useReverb();
  const { volume } = useVolume();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const audioBufferRef = useRef(null);
  const analyserRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setDuration(audioBufferRef.current.duration);
        gainNodeRef.current = audioContextRef.current.createGain();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        gainNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      };
      reader.readAsArrayBuffer(file);
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [file]);

  useEffect(() => {
    if (isPlaying) {
      playAudio(currentTime);
    }
  }, [pitch, reverbAmount, volume]);

  const setupAudio = async (startTime = 0) => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    sourceNodeRef.current = createAudioSource(audioContextRef.current, audioBufferRef.current);
    const processedSource = applyAudioProcessing(audioContextRef.current, sourceNodeRef.current, [
      (ctx, src) => [applyPitchToSource(src, pitch)],
      (ctx, src) => applyReverbToSource(ctx, src, reverbAmount),
      (ctx, src) => applyVolumeToSource(ctx, src, volume)
    ]);
    
    processedSource.connect(gainNodeRef.current);
    return sourceNodeRef.current;
  };

  const playAudio = async (startFrom = 0) => {
    const source = await setupAudio();
    startTimeRef.current = audioContextRef.current.currentTime - startFrom;
    source.start(0, startFrom);
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
  };

  const togglePlayPause = async () => {
    if (audioContextRef.current && audioBufferRef.current) {
      if (isPlaying) {
        sourceNodeRef.current.stop();
        setIsPlaying(false);
      } else {
        playAudio(currentTime);
      }
    }
  };

  useEffect(() => {
    let animationFrameId;
    const updateCurrentTime = () => {
      if (isPlaying && audioContextRef.current) {
        const newTime = audioContextRef.current.currentTime - startTimeRef.current;
        setCurrentTime(newTime);
        animationFrameId = requestAnimationFrame(updateCurrentTime);
      }
    };
    updateCurrentTime();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying]);

  const handleSeek = (seekTime) => {
    if (isPlaying) {
      sourceNodeRef.current.stop();
    }
    setCurrentTime(seekTime);
    if (isPlaying) {
      playAudio(seekTime);
    } else {
      startTimeRef.current = audioContextRef.current.currentTime - seekTime;
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    try {
      const renderedBuffer = await processEntireAudio(audioBufferRef.current, [
        (ctx, src) => [applyPitchToSource(src, pitch)],
        (ctx, src) => applyReverbToSource(ctx, src, reverbAmount),
        (ctx, src) => applyVolumeToSource(ctx, src, volume)
      ]);
      
      const wavBlob = audioBufferToWav(renderedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setProcessedAudioUrl(url);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadProcessedAudio = () => {
    if (processedAudioUrl) {
      const a = document.createElement('a');
      a.href = processedAudioUrl;
      a.download = 'tweaked_audio.wav';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-800 p-4 rounded-lg">
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">Tweaked Audio</h2>
      <WaveformVisualizer 
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onSeek={handleSeek}
        audioContext={audioContextRef.current}
        analyser={analyserRef.current}
      />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={togglePlayPause}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
            disabled={!file}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <span className="text-zinc-300 text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={processAudio}
            disabled={isProcessing || !file}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
          {processedAudioUrl && (
            <button
              onClick={downloadProcessedAudio}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Download
            </button>
          )}
        </div>
      </div>
    </div>
  );
}