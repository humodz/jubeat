import axios from 'axios';
import axiosRetry from 'axios-retry';
import {
  downloadJackets,
  getBeatMapFilename,
  getJacketFilename,
  scrapeBeatMaps,
  scrapeSongList,
  SongInfo,
} from './scraper';
import { cache, hash, saveJson } from './utils';

async function main() {
  axiosRetry(axios, {
    retries: 3,
    shouldResetTimeout: true,
    retryDelay(retryCount, error) {
      console.error('[axios-retry]', error);
      return 1000 * Math.pow(2, retryCount) * (1 + Math.random() / 5);
    },
  });

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

  const finalData = songs.map((song) => {
    return {
      id: getSongId(song),
      title: {
        original: song.atwiki.title,
        romaji: song.remywiki?.title ?? null,
      },
      artist: song.atwiki.artist,
      bpm: song.atwiki.bpm,
      jacketUrl: getJacketUrl(song.remywiki?.jacketUrl),
      levels: song.atwiki.levels.map((level) => ({
        ...level,
        beatMapUrl: getBeatMapUrl(level.beatMapUrl),
      })),
    };
  });

  saveJson('tmp/result/songs.json', finalData);
}

function getSongId(song: SongInfo) {
  return hash(
    [
      song.atwiki.bpm,
      ...song.atwiki.levels.map((level) => [
        level.level,
        level.difficulty,
        level.notes,
      ]),
    ].join('#'),
  );
}

function getJacketUrl(url: string | null | undefined) {
  if (!url) {
    return null;
  }
  return 'game-data/jackets/' + getJacketFilename(url);
}

function getBeatMapUrl(url: string | null) {
  if (!url) {
    return null;
  }
  return 'game-data/beatmaps/' + getBeatMapFilename(url);
}

main().catch(console.error);
