import { load } from 'cheerio';
import { by, chunks, enumerate, fetchWithCache, splitAt } from './utils';

export async function scrapeAtWikiCosmosMemo(url: string) {
  const html = await fetchPage(url);
  const $ = load(html);
  const text = $('#wikibody').text().trim();
  return await parse(url, text);
}

async function fetchPage(url: string) {
  return await fetchWithCache('tmp/pages/atwiki-cosmos', url);
}

interface BeatMapStep {
  time: number;
  taps: number[];
}

// TODO hold markers
async function parse(source: string, data: string) {
  const lines = data.split('\n').filter((it) => it);

  const [title, artist, difficulty, levelRaw, bpmRaw, notesRaw, ...chartRaw] =
    lines;

  const level = Number(levelRaw.split(' ').pop());
  const bpm = Number(bpmRaw.split(' ').pop());
  const notes = Number(notesRaw.split(' ').pop());

  const chart = chartRaw.slice(0, -1).map((it) => it.trim());
  const pages = splitAt(chart, (line) => line !== '' && !isNaN(Number(line)));

  const beatMap: BeatMapStep[] = [];
  let currentBeat = 0;
  const secondsPerBeat = 60 / bpm;

  for (const page of pages) {
    const signToPosition: Record<string, number[]> = {};
    const signToBeat: Record<string, number> = {};

    const screens = chunks(page, 4);

    for (const screen of screens) {
      for (const [row, y] of enumerate(screen)) {
        const rowArray = row.split('');

        const screenRow = rowArray.slice(0, 4);
        const meter = rowArray.slice(6, 10);

        for (const [cell, x] of enumerate(screenRow)) {
          signToPosition[cell] = signToPosition[cell] ?? [];
          signToPosition[cell].push(x + y * 4);
        }

        const LONG_DASH = '\uff0d'; // －

        if (meter.length > 0) {
          for (const [sign, quarterBeat] of enumerate(meter)) {
            if (sign !== LONG_DASH) {
              signToBeat[sign] = currentBeat + quarterBeat / 4;
            }
          }

          currentBeat += 1;
        }
      }
    }

    const sortedSignAndBeat = Object.entries(signToBeat).sort(
      by((it) => it[1]),
    );

    for (const [sign, beat] of sortedSignAndBeat) {
      beatMap.push({
        time: beat * secondsPerBeat,
        taps: signToPosition[sign] ?? [],
      });
    }
  }

  return {
    meta: {
      source,
      title,
      artist,
      difficulty,
      level,
      bpm,
      notes,
    },
    data: beatMap,
  };
}
