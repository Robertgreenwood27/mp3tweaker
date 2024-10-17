import { useStore } from '../store';
import OriginalAudioPlayer from '../components/OriginalAudioPlayer';
import Tweakers from '../components/Tweakers';
import TweakedAudio from '../components/TweakedAudio';

export default function Home() {
  const { file } = useStore();

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-start p-4">
      <OriginalAudioPlayer />
      <Tweakers />
      <TweakedAudio />
    </div>
  );
}