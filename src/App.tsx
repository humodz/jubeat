import { useState } from 'react';
import { GameComponent } from './components/GameComponent';
import { SongSummary } from './components/SongSummary';
import { loadAssets } from './game/loaders/assets';
import { loadTrack } from './game/loaders/track';
import { loadVoices } from './game/loaders/voices';
import { SongInfo } from './types';
import { useLoader } from './utils/hooks';

const trackData = {
  lagSeconds: 0.7,
  volume: 0.2,
};

export function App() {
  const songsQuery = useLoader(async () => {
    const response = await fetch('game-data/songs.json');
    return (await response.json()) as SongInfo[];
  });

  if (songsQuery.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (songsQuery.status === 'error') {
    return <p>ERROR {songsQuery.error.message}</p>;
  }

  const songs = songsQuery.data;

  return (
    <>
      {songs.map((song) => (
        <SongSummary key={song.id} song={song} />
      ))}
    </>
  );
}

export function App2() {
  const song: any = null;
  const beatMap: any = null;

  const dataQuery = useLoader(async () => {
    const [audio, assets, voices] = await Promise.all([
      loadTrack(song),
      loadAssets(),
      loadVoices(),
    ]);
    return { audio, assets, voices };
  });

  const [isStarted, setIsStarted] = useState(false);

  if (dataQuery.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (dataQuery.status === 'error') {
    return <p>ERROR {dataQuery.error.message}</p>;
  }

  const { audio, assets, voices } = dataQuery.data;

  return (
    <>
      <p>
        <button onClick={() => setIsStarted(true)}>Start</button>
      </p>
      {isStarted && (
        <GameComponent
          song={song}
          beatMap={beatMap}
          audio={audio}
          voices={voices}
          assets={assets}
          onFinish={() => setIsStarted(false)}
        />
      )}
    </>
  );
}
