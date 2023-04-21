import axios from 'axios';
import { Stream } from 'stream';
import { scrapeBeatMaps, scrapeSongList, SongInfo } from './scraper';
import { cache, hash, progress, saveIfNotExists } from './utils';

async function main() {
  const songs = await scrapeSongList();

  const songsWithBeatMaps = songs.filter((song) =>
    song.atwiki.levels.some((level) => level.beatMapUrl !== null),
  );

  console.log({ songsWithBeatMaps: songsWithBeatMaps.length });

  await cache('tmp/data/beatmaps-done.json', async () => {
    await scrapeBeatMaps(songsWithBeatMaps);
    return 'done';
  });

  const songsWithJacket = songs.filter((song) => song.remywiki?.jacketUrl);
  console.log({ songsWithJacket: songsWithJacket.length });

  await downloadJackets(songsWithJacket);
}

export async function downloadJackets(songs: SongInfo[]) {
  await progress('[downloadJackets]', songs, async (song) => {
    const url = song.remywiki?.jacketUrl;

    if (url) {
      return await downloadJacket(url);
    }
  });
}

export async function downloadJacket(jacketUrl: string) {
  const filename = `tmp/result/jackets/${hash(jacketUrl)}`;

  await saveIfNotExists(filename, async () => {
    const response = await axios.get<Stream>(jacketUrl, {
      responseType: 'stream',
    });

    return response.data;
  });
}

main().catch(console.error);
