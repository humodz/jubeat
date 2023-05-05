import { useState } from 'react';
import { SongSelectScreen } from './screens/SongSelectScreen';
import { SongInfo } from './types';

const trackData = {
  lagSeconds: 0.7,
  volume: 0.2,
};

type Screen =
  | { type: 'song-select' }
  | { type: 'song-details'; song: SongInfo };

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
        <p>Song Details</p>
        <pre>
          <code>{JSON.stringify(screen.song, null, 2)}</code>
        </pre>
      </>
    );
  }

  return <p>Not Found</p>;
}
