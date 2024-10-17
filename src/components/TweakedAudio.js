import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { usePitch, applyPitchToSource } from '../pitch';
import { createAudioSource, applyAudioProcessing, processEntireAudio, audioBufferToWav } from '../audioProcessing';

export default function TweakedAudio() {
  const { file } = useStore();
  const { pitch } = usePitch();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAudioUrl, setProcessedAudioUrl] = useState(null);
  const audioContextRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const audioBufferRef = useRef(null);
  const startTimeRef = useRef(0);
  const pauseTimeRef = useRef(0);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        audioBufferRef.current = await audioContextRef.current.decodeAudioData(arrayBuffer);
        setDuration(audioBufferRef.current.duration);
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
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
  }, [pitch]);

  const setupAudio = async (startTime = 0) => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    sourceNodeRef.current = createAudioSource(audioContextRef.current, audioBufferRef.current);
    applyAudioProcessing(sourceNodeRef.current, [
      (source) => applyPitchToSource(source, pitch)
    ]);
    sourceNodeRef.current.connect(gainNodeRef.current);
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
        pauseTimeRef.current = audioContextRef.current.currentTime - startTimeRef.current;
        setIsPlaying(false);
      } else {
        playAudio(pauseTimeRef.current);
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

  const handleSliderChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    pauseTimeRef.current = newTime;
    if (isPlaying) {
      sourceNodeRef.current.stop();
      playAudio(newTime);
    }
  };

  const processAudio = async () => {
    setIsProcessing(true);
    try {
      const renderedBuffer = await processEntireAudio(audioBufferRef.current, [
        (source) => applyPitchToSource(source, pitch)
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
    <div className="w-full max-w-4xl mb-8 flex flex-wrap">
      <div className="w-full p-4 bg-zinc-800 rounded-lg">
        <h2 className="text-zinc-100 text-lg font-semibold mb-4">Tweaked Audio</h2>
        {file ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={togglePlayPause}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="text-zinc-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={processAudio}
                disabled={isProcessing}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Process Audio'}
              </button>
              {processedAudioUrl && (
                <button
                  onClick={downloadProcessedAudio}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Download Tweaked Audio
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-zinc-400 text-center">Upload an MP3 to tweak and play</p>
        )}
      </div>
    </div>
  );
}