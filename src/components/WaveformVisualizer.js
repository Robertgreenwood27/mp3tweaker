import React, { useEffect, useRef, useState } from 'react';

export default function WaveformVisualizer({ currentTime, duration, isPlaying, onSeek, audioContext, analyser }) {
  const canvasRef = useRef(null);
  const [dataArray, setDataArray] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (analyser) {
      const bufferLength = analyser.frequencyBinCount;
      const newDataArray = new Uint8Array(bufferLength);
      setDataArray(newDataArray);
    }
  }, [analyser]);

  useEffect(() => {
    if (isPlaying) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => stopVisualization();
  }, [isPlaying, analyser, dataArray]);

  const startVisualization = () => {
    if (!analyser || !dataArray) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      drawWaveform();
    };

    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // Blue color
    ctx.beginPath();

    const sliceWidth = width * 1.0 / dataArray.length;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * height / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
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
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleCanvasClick = (e) => {
    if (duration > 0) {
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