import { SongTrack } from '../../types';
import { loadAudio } from '../../utils/audio';

export async function loadTrack(track: SongTrack) {
  const audio = await loadAudio(track.url);
  audio.volume = track.volume;
  return audio;
}
