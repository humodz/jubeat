import axios from 'axios';
import { load } from 'cheerio';
import { join } from 'path';
import { cache, hash } from './utils';

export const atWikiUrls = {
  songListArcade: 'https://w.atwiki.jp/cosmos_memo/pages/16.html',
  songListPlus: 'https://w.atwiki.jp/cosmos_memo/pages/551.html',
};

export async function scrapeAtWikiSongList(url: string) {
  const html = await fetchPage(url);
  const $ = load(html);

  const allRows = $('#wikibody tr');

  const wantedRows = allRows.not(
    (i, item) => i === 0 || $(item).find('[colspan]').length > 0,
  );

  const data = wantedRows.toArray().map((row) => {
    const [title, artist, bpmRaw, ...levelsRaw] = $(row)
      .find('td')
      .toArray()
      .map((td) => $(td).text().trim());

    const beatMapUrls = $(row)
      .find('a')
      .toArray()
      .map((a) => {
        const href = $(a).attr('href');

        return {
          label: $(a).text().trim(),
          url: href
            ? new URL(href, atWikiUrls.songListArcade).toString()
            : null,
        };
      });

    const difficulties = ['BAS', 'ADV', 'EXT'];

    const levels = levelsRaw.map((levelRaw, i) => {
      const match = levelRaw.match(/^Lv (\d+) [(](\d+)[)]$/);

      if (!match) {
        throw new Error(`Failed to parse level info: ${title} ${levelRaw}`);
      }

      const [, level, notes] = match.map((it) => Number(it));

      const beatMap = beatMapUrls.find((it) => it.label === levelRaw) ?? null;

      return {
        level,
        difficulty: difficulties[i],
        notes,
        beatMapUrl: beatMap?.url ?? null,
      };
    });

    return {
      title,
      artist,
      bpm: Number(bpmRaw),
      levels,
    };
  });

  return data;
}

async function fetchPage(url: string) {
  const filePath = join('tmp/pages/atwiki', hash(url));

  return await cache(filePath, async () => {
    const response = await axios.get<string>(url, { responseType: 'text' });
    return response.data;
  });
}
