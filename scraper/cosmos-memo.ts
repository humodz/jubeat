/* eslint-disable @typescript-eslint/no-var-requires */
import axios from 'axios';
import { load as cheerioLoad } from 'cheerio';
import * as fs from 'fs';
import { by, enumerate, splitAt } from './utils';

interface BeatMapStep {
  time: number;
  taps: number[];
}

async function main() {
  await download();
  await parse();
}

async function parse() {
  const data = fs.readFileSync('tmp/kimi-wo-nosete.txt', 'utf-8');
  const lines = data.split('\n');

  const [
    songName,
    author,
    ,
    difficulty,
    ,
    levelRaw,
    bpmRaw,
    notesRaw,
    ,
    ...chartRaw
  ] = lines;

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

    const screens = splitAt(page, (line) => line === '');

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

  // const song = { songName, author, difficulty, level, bpm, notes };
  console.log(JSON.stringify(beatMap, null, 2));
}

async function download() {
  const url = 'https://w.atwiki.jp/cosmos_memo/pages/522.html';
  const response = await axios.get(url);

  const $ = cheerioLoad(response.data);
  const text = $('#wikibody p').text().trim();

  fs.mkdirSync('tmp', { recursive: true });
  fs.writeFileSync('tmp/kimi-wo-nosete.txt', text);
}

main().catch(console.error);
