import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';

export default function WaveformVisualizer({ currentTime, duration, isPlaying, onSeek }) {
  const canvasRef = useRef(null);
  const { file } = useStore();
  const [waveformData, setWaveformData] = useState(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(e.target.result);
        const channelData = audioBuffer.getChannelData(0);
        setWaveformData(channelData);
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  useEffect(() => {
    if (waveformData && canvasRef.current) {
      drawWaveform();
    }
  }, [waveformData, currentTime, isPlaying]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw waveform
    const step = Math.ceil(waveformData.length / width);
    const amp = height / 2;

    ctx.beginPath();
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = waveformData[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.strokeStyle = '#3b82f6'; // Blue color
    ctx.stroke();

    // Draw played portion
    if (duration > 0) {
      const playedWidth = (currentTime / duration) * width;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'; // Semi-transparent blue
      ctx.fillRect(0, 0, playedWidth, height);
    }

    // Draw playback position
    const position = (currentTime / duration) * width;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, height);
    ctx.strokeStyle = '#ef4444'; // Red color
    ctx.stroke();
  };

  const handleCanvasClick = (e) => {
    if (waveformData && duration > 0) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const seekTime = (x / canvas.width) * duration;
      onSeek(seekTime);
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-40 bg-zinc-700 rounded-lg cursor-pointer"
      width={800}
      height={160}
      onClick={handleCanvasClick}
    />
  );
}