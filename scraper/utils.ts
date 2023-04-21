import axios from 'axios';
import { createHash } from 'crypto';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import * as inquirer from 'inquirer';
import { dirname, join } from 'path';
import { Stream } from 'stream';

export function splitAt<T>(items: T[], splitFn: (it: T) => boolean): T[][] {
  const result: T[][] = [];

  let currentChunk: T[] = [];

  for (const item of items) {
    if (!splitFn(item)) {
      currentChunk.push(item);
    } else if (currentChunk.length > 0) {
      result.push(currentChunk);
      currentChunk = [];
    }
  }

  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}

export function chunks<T>(items: T[], chunkSize: number): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    result.push(items.slice(i, i + chunkSize));
  }

  return result;
}

export function enumerate<T>(items: T[]): [T, number][] {
  return items.map((it, i) => [it, i]);
}

export function by<Item, Key>(
  fn: (item: Item) => Key,
): (item1: Item, item2: Item) => number {
  return (item1, item2) => {
    const key1 = fn(item1);
    const key2 = fn(item2);

    return key1 < key2 ? -1 : key1 > key2 ? 1 : 0;
  };
}

export async function cache<T>(
  path: string,
  factory: () => Promise<T>,
): Promise<T> {
  if (process.env.NO_CACHE === 'true') {
    return await factory();
  }

  if (existsSync(path)) {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
  }

  const dir = dirname(path);

  await mkdir(dir, { recursive: true });

  const data = await factory();
  await writeFile(path, JSON.stringify(data));
  return data;
}

export async function saveIfNotExists(
  path: string,
  factory: () => Promise<string | Buffer | Stream>,
) {
  if (process.env.NO_CACHE === 'true') {
    await factory();
  }

  if (existsSync(path)) {
    return;
  }

  const dir = dirname(path);

  await mkdir(dir, { recursive: true });

  const data = await factory();
  await writeFile(path, data);
  return data;
}

export function asyncQueue() {
  let lastPromise: Promise<unknown> = Promise.resolve();

  return <T>(fn: () => Promise<T>): Promise<T> => {
    const p = lastPromise.then(() => fn());
    lastPromise = p;
    return p;
  };
}

export function hash(text: string) {
  return createHash('md5').update(text).digest('hex');
}

export function last<T>(items: T[]): T {
  return items[items.length - 1];
}

export async function saveFile(name: string, content: string | Stream) {
  await mkdir(dirname(name), { recursive: true });
  await writeFile(name, content);
}

export async function saveJson(name: string, content: unknown) {
  await mkdir(dirname(name), { recursive: true });
  await writeFile(name, JSON.stringify(content, null, 2));
}

export async function fetchWithCache(cachePath: string, url: string) {
  const filePath = join(cachePath, hash(url));

  return await cache(filePath, async () => {
    const response = await axios.get<string>(url);
    return response.data;
  });
}

export async function progress<T, R>(
  title: string,
  items: T[],
  process: (item: T) => Promise<R>,
): Promise<R[]> {
  const ui = new inquirer.ui.BottomBar();
  await inquirer.prompt([]);
  let done = 0;

  ui.updateBottomBar(`${title} ${done} / ${items.length} `);

  return await Promise.all(
    items.map(async (item) => {
      const result = await process(item);
      done += 1;
      ui.updateBottomBar(`${title} ${done} / ${items.length} `);
      return result;
    }),
  );
}
