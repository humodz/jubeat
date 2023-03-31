import { waitEvent } from '.';

export async function loadAudio(url: string) {
  const data = await fetch(url).then((res) => res.blob());
  const blobUrl = URL.createObjectURL(data);

  const audio = new Audio(blobUrl);
  audio.loop = false;

  await waitEvent(audio, 'canplaythrough');

  return audio;
}
