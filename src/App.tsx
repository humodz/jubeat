import { GameScreen } from './screens/GameScreen';
import { SongListScreen } from './screens/SongListScreen';
import { useAppSelector } from './store';
import { AppScreen, selectScreen } from './store/appSlice';

export function App() {
  const screen = useAppSelector(selectScreen);

  return (
    <main>
      <p>{screen}</p>
      {screen === AppScreen.SONG_LIST ? (
        <SongListScreen />
      ) : screen === AppScreen.GAME ? (
        <GameScreen />
      ) : (
        <p>Unknown screen</p>
      )}
    </main>
  );
}
