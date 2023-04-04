import * as inquirer from 'inquirer';
import { atWikiUrls, scrapeAtWikiSongList } from './atwiki';
import { scrapeSongInfoFromRemyWiki } from './remywiki';
import { saveFile } from './utils';

async function main() {
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

main().catch(console.error);
