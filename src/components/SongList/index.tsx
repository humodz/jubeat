import kimiWoNoseteBas from '../../game-data/kimi-wo-nosete-2.beatmap.json';
import kimiWoNoseteAdv from '../../game-data/kimi-wo-nosete-6.beatmap.json';
import kimiWoNoseteExt from '../../game-data/kimi-wo-nosete-8.beatmap.json';
import kimiWoNosete from '../../game-data/kimi-wo-nosete.json';

const songs = [
  {
    ...kimiWoNosete,
    beatmaps: {
      bas: kimiWoNoseteBas,
      adv: kimiWoNoseteAdv,
      ext: kimiWoNoseteExt,
    },
  },
];

type Song = (typeof songs)[number];

export function SongList() {
  return (
    <main>
      {songs.map((song, i) => (
        <SongSummary key={i} song={song} />
      ))}
    </main>
  );
}

interface SongSummaryProps {
  song: Song;
}

function SongSummary(props: SongSummaryProps) {
  return <div>{props.song.songName}</div>;
}
