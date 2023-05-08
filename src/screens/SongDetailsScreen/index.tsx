import { SongSummary } from '../../components/SongSummary';
import { SongInfo, SongLevel } from '../../types';

interface SongDetailsScreenProps {
  song: SongInfo;
  onBack?: () => void;
  onSelectLevel?: (level: SongLevel) => void;
}

export function SongDetailsScreen(props: SongDetailsScreenProps) {
  return (
    <>
      <SongSummary song={props.song} />

      <div>{props.song.title.romaji}</div>
      <div>{props.song.title.original}</div>

      <hr></hr>

      <div>
        {props.song.levels.map((level) => (
          <div key={level.level} onClick={() => props.onSelectLevel?.(level)}>
            {level.difficulty}: {level.level} - {level.notes} notes
          </div>
        ))}
      </div>

      <div>
        <button
          style={{ marginLeft: 'auto', display: 'block' }}
          onClick={props.onBack}
        >
          Go Back
        </button>
      </div>

      <div>
        <pre>
          <code>{JSON.stringify(props.song, null, 2)}</code>
        </pre>
      </div>
    </>
  );
}
