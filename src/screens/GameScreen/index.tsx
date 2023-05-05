import { useState } from 'react';
import { GameComponent } from '../../components/GameComponent';
import { loadAssets } from '../../game/loaders/assets';
import { loadTrack } from '../../game/loaders/track';
import { loadVoices } from '../../game/loaders/voices';
import { useLoader } from '../../utils/hooks';

export function GameScreen() {
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