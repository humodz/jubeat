import * as PIXI from 'pixi.js';
import { ISpritesheetData } from 'pixi.js';
import { createRef, useEffect } from 'react';
import { perfect, startHere } from '../../assets';

export function GameScreen() {
  const myRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!myRef.current) {
      return;
    }

    const pixi = new PIXI.Application({
      width: 400,
      height: 400,
    });
    myRef.current.textContent = '';
    myRef.current.append(pixi.view as any);

    async function init() {
      const sprite = PIXI.Sprite.from(startHere);

      sprite.width = 100;
      sprite.height = 100;
      pixi.stage.addChild(sprite);

      let elapsed = 0.0;

      pixi.ticker.add((delta) => {
        elapsed += delta;
        sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;
      });

      const sheet = await loadMarker(perfect);

      const animTextures = sheet.animations.animated;
      const animFrames = animTextures.map((texture) => ({
        texture,
        time: 1000 / animTextures.length,
      }));

      const markerSprite = new PIXI.AnimatedSprite(animFrames);
      markerSprite.animationSpeed = 1;
      markerSprite.play();
      markerSprite.width = 100;
      markerSprite.height = 100;

      pixi.stage.addChild(markerSprite);
    }

    const promise = init();

    return () => {
      promise.finally(() => pixi.destroy());
    };
  }, [myRef]);

  return <div ref={myRef}></div>;
}

async function loadMarker(url: string) {
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

function range(length: number) {
  return Array(length)
    .fill(0)
    .map((_, i) => i);
}
