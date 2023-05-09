import { GameContainer } from '../../components/GameContainer';
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
  onFinish: () => void;
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
      <GameContainer
        song={props.song}
        beatMap={beatMap}
        audio={audio}
        voices={voices}
        assets={assets}
        onFinish={props.onFinish}
      />
    </>
  );
}

function loadBeatMap(beatMapUrl: string) {
  return fetchJson<BeatMap>(beatMapUrl);
}
