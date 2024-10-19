import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';

export default function OriginalAudioPlayer() {
  const { file, setFile } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
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

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "audio/mpeg") {
        setFile(selectedFile);
      } else {
        alert("Please select an MP3 file.");
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-zinc-800 p-2">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">MP3 Tweaker</h1>
        <div className="flex items-center space-x-2">
          {file ? (
            <>
              <span className="text-zinc-300 text-sm truncate max-w-xs">{file.name}</span>
              <button
                onClick={togglePlayPause}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm"
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <span className="text-zinc-300 text-sm">
                {formatTime(duration)}
              </span>
            </>
          ) : (
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded text-sm">
              Upload MP3
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mpeg"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </header>
  );
}