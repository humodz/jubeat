import { useState } from 'react';
import { GameSession } from './components/GameSession';
import kimiWoNoseteData from './game-data/kimi-wo-nosete-6.beatmap.json';
import kimiWoNosete from './game-data/kimi-wo-nosete.json';
import { loadAssets } from './game/loaders/assets';
import { loadTrack } from './game/loaders/track';
import { Song } from './game/types';
import { sleep } from './utils';
import { useLoader } from './utils/hooks';

const beatMap = {
  difficulty: 6,
  data: kimiWoNoseteData,
};

const song: Song = {
  ...kimiWoNosete,
  track: {
    url: '/game-data/kimi-wo-nosete.mp3',
    volume: 0.25,
    lagSeconds: 0.5,
  },
  beatMaps: {},
};

export function App() {
  const dataQuery = useLoader(async () => {
    await sleep(2000);

    const [trackBlobUrl, assets] = await Promise.all([
      loadTrack(song),
      loadAssets(),
    ]);

    return { trackBlobUrl, assets };
  });

  const [isStarted, setIsStarted] = useState(false);

  if (dataQuery.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (dataQuery.status === 'error') {
    return <p>ERROR {dataQuery.error.message}</p>;
  }

  const { trackBlobUrl, assets } = dataQuery.data;

  return (
    <>
      <p>
        <button onClick={() => setIsStarted(true)}>Start</button>
      </p>
      {isStarted && (
        <GameSession
          song={song}
          beatMap={beatMap}
          trackBlobUrl={trackBlobUrl}
          assets={assets}
        />
      )}
    </>
  );
}
