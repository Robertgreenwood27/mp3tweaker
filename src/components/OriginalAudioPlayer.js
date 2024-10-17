import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';

export default function OriginalAudioPlayer() {
  const { file, setFile } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file) {
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      audioRef.current = audio;
    }
  }, [file]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleSliderChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    audioRef.current.currentTime = time;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      }
    };
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type === "audio/mpeg") {
      setFile(file);
    } else {
      alert("Please select an MP3 file.");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full max-w-4xl mb-8 flex flex-wrap">
      <div
        className={`w-full p-4 rounded-lg border-2 border-dashed transition-colors ${
          dragActive ? 'border-blue-500 bg-zinc-800' : 'border-zinc-700 bg-zinc-800'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <h2 className="text-zinc-100 text-lg font-semibold mb-4">Upload MP3</h2>
        <div className="flex flex-col items-center">
          <p className="text-zinc-400 text-center mb-4">
            {file ? file.name : "Drag and drop an MP3 file here or click the button below"}
          </p>
          <button
            onClick={triggerFileInput}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Browse Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/mpeg"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
      {file && (
        <div className="w-full mt-4 p-4 bg-zinc-800 rounded-lg">
          <h2 className="text-zinc-100 text-lg font-semibold mb-4">Playback Controls</h2>
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
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}