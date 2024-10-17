import React from 'react';
import { usePitch } from '../pitch';
import { useReverb } from '../reverb';
import { useVolume } from '../volume';

export default function Tweakers() {
  const { pitch, setPitch } = usePitch();
  const { reverbAmount, setReverbAmount } = useReverb();
  const { volume, setVolume } = useVolume();

  return (
    <div className="w-full max-w-md mb-8 p-4 bg-zinc-800 rounded-lg">
      <h2 className="text-zinc-100 text-lg font-semibold mb-4">Audio Tweakers</h2>
      <div className="mb-4">
        <label className="block text-zinc-300 mb-2">Pitch</label>
        <input
          type="range"
          min="-12"
          max="12"
          value={pitch}
          onChange={(e) => setPitch(parseInt(e.target.value))}
          className="w-full bg-zinc-700 appearance-none h-2 rounded-full"
        />
        <div className="text-zinc-300 text-sm mt-1">
          {pitch > 0 ? `+${pitch}` : pitch} semitones
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-zinc-300 mb-2">Reverb</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={reverbAmount}
          onChange={(e) => setReverbAmount(parseFloat(e.target.value))}
          className="w-full bg-zinc-700 appearance-none h-2 rounded-full"
        />
        <div className="text-zinc-300 text-sm mt-1">
          {(reverbAmount * 100).toFixed(0)}%
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-zinc-300 mb-2">Volume</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full bg-zinc-700 appearance-none h-2 rounded-full"
        />
        <div className="text-zinc-300 text-sm mt-1">
          {(volume * 100).toFixed(0)}% {volume > 1 ? `(${(volume / 1 * 100).toFixed(0)}% amplification)` : ''}
        </div>
      </div>
    </div>
  );
}