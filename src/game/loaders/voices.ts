import { loadAudio } from '../../utils/audio';
import { Voices } from '../types';

export async function loadVoices(): Promise<Voices> {
  const voices = await Promise.all([
    loadAudio('/voice/ready.m4a'),
    loadAudio('/voice/go.m4a'),
  ]);

  for (const voice of voices) {
    voice.volume = 0.3;
  }

  const [ready, go] = voices;

  return { ready, go };
}
