import { readFileSync } from 'fs';
import * as inquirer from 'inquirer';
import { AtWikiSongInfo, atWikiUrls, scrapeAtWikiSongList } from './atwiki';
import { scrapeAtWikiCosmosMemo } from './cosmos-memo';
import { scrapeSongInfoFromRemyWiki } from './remywiki';
import { hash, saveFile } from './utils';

async function main1() {
  const ui = new inquirer.ui.BottomBar();
  await inquirer.prompt([]);

  const [arcadeSongs, plusSongs] = await Promise.all([
    scrapeAtWikiSongList(atWikiUrls.songListArcade),
    scrapeAtWikiSongList(atWikiUrls.songListPlus),
  ]);

  const songList = [...arcadeSongs, ...plusSongs];

  let done = 0;

  const result = await Promise.all(
    songList.map(async (song) => {
      const remywikiData = await scrapeSongInfoFromRemyWiki(song.title);

      done += 1;

      ui.updateBottomBar(`Progress: ${done} / ${songList.length} `);

      return {
        atwiki: song,
        remywiki: remywikiData,
      };
    }),
  );

  const notFoundOnRemy = result.filter((it) => !it.remywiki).length;

  console.log({
    total: songList.length,
    notFoundOnRemy,
  });

  const raw = JSON.stringify(result, null, 2);
  await saveFile('tmp/result/song-list.json', raw);
  console.log('done');
}

interface SongInfo {
  atwiki: AtWikiSongInfo;
}

async function main2() {
  const songList: SongInfo[] = JSON.parse(
    readFileSync('tmp/result/song-list.json', 'utf-8'),
  );

  const beatMapUrls = songList
    .flatMap((song) => song.atwiki.levels)
    .flatMap((level) => level.beatMapUrl)
    .filter((url): url is string => url !== null);

  const firstUrl = beatMapUrls[0];

  console.log(firstUrl);
  const beatMap = await scrapeAtWikiCosmosMemo(firstUrl);

  const filename = `tmp/result/beatmaps/${hash(firstUrl)}.beatmap.json`;
  const data = JSON.stringify(beatMap, null, 2);
  saveFile(filename, data);
}

main2().catch(console.error);
