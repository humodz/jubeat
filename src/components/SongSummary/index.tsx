import { Level, Song } from '../../game/types';

interface SongSummaryProps {
  song: Song;
  onPlay?: (level: Level) => void;
}

export function SongSummary(props: SongSummaryProps) {
  return (
    <div>
      <p>
        <strong>{props.song.songName}</strong>
      </p>
      {Object.entries(props.song.beatMaps).map(
        ([level, beatMap]) =>
          beatMap && (
            <div key={level} onClick={() => props.onPlay?.(level as Level)}>
              {level}: {beatMap.difficulty}
            </div>
          ),
      )}
    </div>
  );
}
