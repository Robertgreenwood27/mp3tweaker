import React from 'react';
import { usePitch } from '../pitch';

export default function Tweakers() {
  const { pitch, setPitch } = usePitch();

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
    </div>
  );
}