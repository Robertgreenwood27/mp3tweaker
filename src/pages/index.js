import { useStore } from '../store';
import OriginalAudioPlayer from '../components/OriginalAudioPlayer';
import Tweakers from '../components/Tweakers';
import TweakedAudio from '../components/TweakedAudio';

export default function Home() {
  const { file } = useStore();

  return (
    <div className="h-screen bg-zinc-900 flex flex-col">
      <OriginalAudioPlayer />
      <main className="flex-1 flex p-4 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto flex gap-4">
          <div className="w-1/3">
            <Tweakers />
          </div>
          <div className="w-2/3 flex flex-col">
            <TweakedAudio />
          </div>
        </div>
      </main>
    </div>
  );
}