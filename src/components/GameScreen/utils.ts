import * as PIXI from 'pixi.js';
import { ISpritesheetData } from 'pixi.js';

export async function loadMarker(url: string) {
  const name = `frame-${Math.random()}-`;

  const gridRows = 5;
  const gridCols = 5;

  const texture = await PIXI.Texture.fromURL(url);
  const extension = url.split('.').pop();

  const frameWidth = texture.width / gridCols;
  const frameHeight = texture.height / gridRows;

  const frameList: PIXI.ISpritesheetFrameData[] = range(gridRows)
    .map((row) =>
      range(gridCols).map((col) => {
        return {
          frame: {
            w: frameWidth,
            h: frameHeight,
            x: col * frameWidth,
            y: row * frameHeight,
          },
        };
      }),
    )
    .flat();

  const frames: ISpritesheetData['frames'] = Object.fromEntries(
    frameList.map((frame, i) => [`${name}${i}.${extension}`, frame]),
  );

  const sheet = new PIXI.Spritesheet(texture, {
    frames,
    animations: {
      animated: Object.keys(frames),
    },
    meta: {
      scale: '1',
    },
  });

  await sheet.parse();

  return sheet;
}

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
