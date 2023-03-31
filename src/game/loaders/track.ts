import { loadAudio } from '../../utils/audio';
import { Song } from '../types';

export async function loadTrack(song: Song) {
  const audio = await loadAudio(song.track.url);
  audio.volume = song.track.volume;
  return audio;
}
