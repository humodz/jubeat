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

export async function scrapeSongInfoFromRemyWiki(
  songName: string,
  fallbackUrl?: string,
) {
  const altRegExp = /\s*\[\d+\]$/;
  const [altSuffix] = altRegExp.exec(songName) || [''];

  const html = await getRemyWikiPage(
    songName.replace(altRegExp, ''),
    fallbackUrl,
  );

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

export async function getRemyWikiPage(songName: string, fallbackUrl?: string) {
  if (fallbackUrl) {
    const filename = hash(fallbackUrl);
    return await cache(
      join(`tmp/pages/remywiki-fallback`, filename),
      async () => {
        const response = await axios.get<string>(fallbackUrl);
        return response.data;
      },
    );
  } else {
    return await searchRemyWiki(songName);
  }
}

export async function searchRemyWiki(songName: string) {
  const url = new URL(urls.searchSong);
  url.searchParams.set('search', songName);

  const filename = hash(songName);

  return await cache(join(`tmp/pages/remywiki-search`, filename), async () => {
    const response = await axios.get<string>(url.toString());

    const { responseUrl } = response.request?.res;
    const html = response.data;

    if (!responseUrl) {
      throw new Error(`Response URL missing for ${songName}}`);
    }

    const { pathname } = new URL(responseUrl);

    if (pathname === '/index.php') {
      return await browseSearchResults(songName, html);
    }

    return html;
  });
}

function browseSearchResults(songName: string, html: string) {
  const $ = load(html);

  const items = $('li.mw-search-result').filter((i, elem) => {
    const altTitle = $(elem).find('.searchalttitle').text().trim();

    const isSection = noWs(altTitle).includes(noWs(`(section ${songName})`));
    const isRedirect = noWs(altTitle).includes(
      noWs(`(redirect from ${songName})`),
    );

    return isSection || isRedirect;
  });

  const url = items.find('a').first().attr('href');

  if (!url) {
    return null;
  }

  return new URL(url, urls.base).toString();
}

function noWs(text: string) {
  return text.replace(/\s+/g, '');
}
