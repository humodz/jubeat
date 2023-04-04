import axios from 'axios';
import { load } from 'cheerio';
import { join } from 'path';
import { cache, hash } from './utils';

const urls = {
  base: 'https://remywiki.com',
  searchSong: 'https://remywiki.com/index.php',
};

export type RemyWikiSongInfo = Awaited<
  ReturnType<typeof scrapeSongInfoFromRemyWiki>
>;

export async function scrapeSongInfoFromRemyWiki(songName: string) {
  const altRegExp = /\s*\[\d+\]$/;
  const [altSuffix] = altRegExp.exec(songName) || [''];

  const html = await searchRemyWiki(songName.replace(altRegExp, ''));

  if (!html) {
    return null;
  }

  const $ = load(html);

  const titleOriginal = $('#mw-content-text h1 .mw-headline').text().trim();
  const titleRomaji = $('.mw-page-title-main').text().trim();
  const jacketUrl = $('#mw-content-text .thumbinner img').first().attr('src');

  return {
    title: {
      original: titleOriginal + altSuffix,
      romaji: titleRomaji + altSuffix,
    },
    jacketUrl: jacketUrl ? new URL(jacketUrl, urls.base).toString() : null,
  };
}

export async function searchRemyWiki(songName: string) {
  const url = new URL(urls.searchSong);
  url.searchParams.set('search', songName);

  const filename = hash(songName);

  return await cache(join(`tmp/pages/remywiki-search`, filename), async () => {
    const response = await axios.get<string>(url.toString());

    const { responseUrl } = response.request?.res;

    if (!responseUrl) {
      throw new Error(`Response URL missing for ${songName}}`);
    }

    const { pathname } = new URL(responseUrl);

    if (pathname === '/index.php') {
      console.warn(`[WARN] searchRemyWiki No exact match for ${songName}`);
      return null;
    }

    return response.data;
  });
}
