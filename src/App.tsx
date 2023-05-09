import { useState } from 'react';
import { GameScreen } from './screens/GameScreen';
import { SongDetailsScreen } from './screens/SongDetailsScreen';
import { SongSelectScreen } from './screens/SongSelectScreen';
import { SongInfo, SongLevel } from './types';

type Screen =
  | { type: 'song-select' }
  | { type: 'song-details'; song: SongInfo }
  | { type: 'game'; song: SongInfo; level: SongLevel };

export function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'song-select' });

  if (screen.type === 'song-select') {
    return (
      <>
        <SongSelectScreen
          onSelect={(song) => setScreen({ type: 'song-details', song })}
        />
      </>
    );
  } else if (screen.type === 'song-details') {
    return (
      <>
        <SongDetailsScreen
          song={screen.song}
          onBack={() => setScreen({ type: 'song-select' })}
          onSelectLevel={(level) =>
            setScreen({ type: 'game', song: screen.song, level })
          }
        />
      </>
    );
  } else if (screen.type === 'game') {
    return (
      <>
        <GameScreen
          song={screen.song}
          level={screen.level}
          onFinish={() =>
            setScreen({ type: 'song-details', song: screen.song })
          }
        />
      </>
    );
  }

  return <p>Not Found</p>;
}
