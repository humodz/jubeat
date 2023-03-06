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
