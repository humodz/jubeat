import * as PIXI from 'pixi.js';
import { ISpritesheetData } from 'pixi.js';
import { range } from '../../utils';

export async function loadMarkers(urls: string[]) {
  return await Promise.all(urls.map(loadMarker));
}

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
