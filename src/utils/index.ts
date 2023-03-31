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

export function rotation(normalized: number) {
  return 2 * Math.PI * normalized;
}

export function degreesToRadians(degrees: number) {
  return (2 * Math.PI * degrees) / 360;
}

export function last<T>(items: T[]): T {
  return items[items.length - 1];
}

export function sleep(ms: number): Promise<void> {
  return new Promise((ok) => setTimeout(ok, ms));
}

export function lazyInit<T>(factory: () => T) {
  let value: T;

  return () => {
    if (!value) {
      value = factory();
    }
    return value;
  };
}

export function waitEvent(target: EventTarget, event: string) {
  return new Promise<void>((resolve) => {
    target.addEventListener(event, () => resolve(), { once: true });
  });
}
