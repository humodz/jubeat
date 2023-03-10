import { useDispatch } from 'react-redux';
import { SongSummary } from '../../components/SongSummary';
import kimiWoNoseteBas from '../../game-data/kimi-wo-nosete-2.beatmap.json';
import kimiWoNoseteAdv from '../../game-data/kimi-wo-nosete-6.beatmap.json';
import kimiWoNoseteExt from '../../game-data/kimi-wo-nosete-8.beatmap.json';
import kimiWoNosete from '../../game-data/kimi-wo-nosete.json';
import { playSong } from '../../store/appSlice';
import { Level, Song } from '../../types';

const songs: Song[] = [
  {
    ...kimiWoNosete,
    track: {
      url: '/game-data/kimi-wo-nosete.mp3',
      volume: 0.25,
      lagSeconds: 0.5,
    },
    beatMaps: {
      [Level.BASIC]: {
        difficulty: 2,
        data: kimiWoNoseteBas,
      },
      [Level.ADVANCED]: {
        difficulty: 6,
        data: kimiWoNoseteAdv,
      },
      [Level.EXTREME]: {
        difficulty: 8,
        data: kimiWoNoseteExt,
      },
    },
  },
];

export function SongListScreen() {
  const dispatch = useDispatch();

  const onPlay = (song: Song, level: Level) => {
    const beatMap = song.beatMaps[level];

    if (beatMap) {
      dispatch(playSong({ song, beatMap }));
    }
  };

  return (
    <main>
      {songs.map((song, i) => (
        <SongSummary
          key={i}
          song={song}
          onPlay={(level) => onPlay(song, level)}
        />
      ))}
    </main>
  );
}
