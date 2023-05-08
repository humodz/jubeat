export function range(length: number) {
  return Array(length)
    .fill(0)
    .map((_, i) => i);
}

export function repeat<T>(n: number, value: () => T) {
  return Array(n)
    .fill(null)
    .map(() => value());
}

export function clear<T>(array: T[]): void {
  array.splice(0, array.length);
}

export function last<T>(items: T[]): T {
  return items[items.length - 1];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((ok) => setTimeout(ok, ms));
}

export function waitEvent(target: EventTarget, event: string) {
  return new Promise<void>((resolve) => {
    target.addEventListener(event, () => resolve(), { once: true });
  });
}

export function by<Item, Key>(
  getAttribute: (item: Item) => Key,
  compare: (key1: Key, key2: Key) => number = (key1, key2) =>
    key1 < key2 ? -1 : key1 > key2 ? 1 : 0,
): (item1: Item, item2: Item) => number {
  return (item1, item2) => {
    const key1 = getAttribute(item1);
    const key2 = getAttribute(item2);

    return compare(key1, key2);
  };
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  ignorePunctuation: true,
  usage: 'sort',
  sensitivity: 'base',
});

export const intlCompare = (key1: string, key2: string) =>
  collator.compare(key1, key2);

export async function fetchJson<Result>(
  ...args: Parameters<typeof fetch>
): Promise<Result> {
  const response = await fetch(...args);

  if (!response.ok) {
    throw Object.assign(new Error(`Request failed: ${response.status}`), {
      response,
    });
  }

  return await response.json();
}
