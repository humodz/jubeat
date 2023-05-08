import { useState } from 'react';
import { GameComponent } from '../../components/GameComponent';
import { loadAssets } from '../../game/loaders/assets';
import { loadTrack } from '../../game/loaders/track';
import { loadVoices } from '../../game/loaders/voices';
import { BeatMap } from '../../game/types';
import { SongInfo, SongLevel } from '../../types';
import { fetchJson } from '../../utils';
import { useLoader } from '../../utils/hooks';

interface GameScreenProps {
  song: SongInfo;
  level: SongLevel;
}

export function GameScreen(props: GameScreenProps) {
  const dataQuery = useLoader(async () => {
    const [audio, assets, voices, beatMap] = await Promise.all([
      props.song.track ? loadTrack(props.song.track) : null,
      loadAssets(),
      loadVoices(),
      loadBeatMap(props.level.beatMapUrl!),
    ]);
    return { audio, assets, voices, beatMap };
  });

  const [isStarted, setIsStarted] = useState(false);

  if (dataQuery.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (dataQuery.status === 'error') {
    return <p>ERROR {dataQuery.error.message}</p>;
  }

  const { audio, assets, voices, beatMap } = dataQuery.data;

  if (!audio) {
    return <p>TO-DO no track available</p>;
  }

  return (
    <>
      <p>
        <button onClick={() => setIsStarted(true)}>Start</button>
      </p>
      {isStarted && (
        <GameComponent
          song={props.song}
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

function loadBeatMap(beatMapUrl: string) {
  return fetchJson<BeatMap>(beatMapUrl);
}
