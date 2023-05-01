import axios from 'axios';
import { Stream } from 'stream';
import { AtWikiSongInfo, atWikiUrls, scrapeAtWikiSongList } from './atwiki';
import { scrapeAtWikiCosmosMemo } from './cosmos-memo';
import { RemyWikiSongInfo, scrapeSongInfoFromRemyWiki } from './remywiki';
import {
  cache,
  hash,
  last,
  progress,
  saveIfNotExists,
  saveJson,
} from './utils';

export interface SongInfo {
  atwiki: AtWikiSongInfo;
  remywiki: RemyWikiSongInfo;
}

export async function scrapeSongList(): Promise<SongInfo[]> {
  const songs = await cache('tmp/data/song-list.json', async () => {
    const [arcadeSongs, plusSongs] = await Promise.all([
      scrapeAtWikiSongList(atWikiUrls.songListArcade),
      scrapeAtWikiSongList(atWikiUrls.songListPlus),
    ]);

    const songList = [...arcadeSongs, ...plusSongs];

    return await progress('[scrapeSongList]', songList, async (song) => {
      const remywikiData = await scrapeSongInfoFromRemyWiki(song.title);

      return {
        atwiki: song,
        remywiki: remywikiData,
      };
    });
  });

  const notFoundOnRemy = songs.filter((it) => !it.remywiki);

  console.log({
    total: songs.length,
    notFoundOnRemy: notFoundOnRemy.length,
  });

  const notFoundOnRemyTemplate = {
    songs: notFoundOnRemy.map((song) => ({
      title: song.atwiki.title,
      url: '',
    })),
  };

  await saveJson('tmp/result/song-list-original.json', songs);
  await saveJson('tmp/result/not-found-on-remy.json', notFoundOnRemyTemplate);

  return songs;
}

export async function scrapeBeatMaps(songs: SongInfo[]) {
  await progress('[scrapeBeatMaps]', songs, async (song) => {
    await scrapeBeatMapsForSong(song);
  });
}

export async function scrapeBeatMapsForSong(song: SongInfo) {
  const beatMapUrls = song.atwiki.levels
    .flatMap((level) => level.beatMapUrl)
    .filter((url): url is string => url !== null);

  const beatMaps = await Promise.all(
    beatMapUrls.map(async (url) => scrapeAtWikiCosmosMemo(url)),
  );

  await Promise.all(
    beatMaps.map(async (beatMap) => {
      const filename = getBeatMapFilename(beatMap.meta.source);
      await saveJson(`tmp/result/beatmaps/${filename}`, beatMap);
    }),
  );
}

export function getBeatMapFilename(beatMapUrl: string) {
  const hashed = hash(beatMapUrl);
  return `${hashed}.beatmap.json`;
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
  const filename = `tmp/result/jackets/${getJacketFilename(jacketUrl)}`;

  await saveIfNotExists(filename, async () => {
    const response = await axios.get<Stream>(jacketUrl, {
      responseType: 'stream',
    });

    return response.data;
  });
}

export function getJacketFilename(jacketUrl: string) {
  const extension = last(jacketUrl.split('.'));
  return `${hash(jacketUrl)}.${extension}`;
}
