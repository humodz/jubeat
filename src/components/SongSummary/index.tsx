import { SongInfo } from '../../types';
import styles from './styles.module.css';

interface SongSummaryProps {
  song: SongInfo;
}

export function SongSummary(props: SongSummaryProps) {
  const { song } = props;

  const blank =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  const jacketUrl = song.jacketUrl || blank;
  const title = song.title.romaji || song.title.original;

  return (
    <div className={styles.songSummary}>
      <img className={styles.jacket} src={jacketUrl} alt={`${title} jacket`} />
      <div className={styles.details}>
        <div className={styles.title}>{title}</div>
        <div className={styles.artist}>{song.artist}</div>

        <div>
          {song.levels.map((level) => (
            <div
              key={level.difficulty}
              className={styles.level}
              data-difficulty={level.difficulty}
            >
              {level.difficulty} | {level.level}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
