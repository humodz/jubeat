import { Song } from '../types';

export async function loadTrack(song: Song) {
  const songBlob = await fetch(song.track.url).then((res) => res.blob());
  return URL.createObjectURL(songBlob);
}
