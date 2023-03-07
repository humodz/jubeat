import { GameScreen } from './components/GameScreen';
import { SongList } from './components/SongList';
import { useAppSelector } from './store';
import { AppScreen, selectScreen } from './store/appSlice';

export function App() {
  const screen = useAppSelector(selectScreen);

  return (
    <main>
      <p>{screen}</p>
      {screen === AppScreen.SONG_LIST ? (
        <SongList />
      ) : screen === AppScreen.GAME ? (
        <GameScreen />
      ) : (
        <p>Unknown screen</p>
      )}
    </main>
  );
}
