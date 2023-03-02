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

    const element = myRef.current;

    const pixi = new PIXI.Application<HTMLCanvasElement>({
      width: 400,
      height: 400,
    });

    element.textContent = '';
    element.append(pixi.view);
    pixi.view.style.maxWidth = '100%';

    const touchMap = initTouch(pixi.view);
    const promise = initPixi(pixi, touchMap);

    return () => {
      promise.finally(() => pixi.destroy());
    };
  }, [myRef]);

  return <div ref={myRef}></div>;
}

interface TouchPoint {
  x: number;
  y: number;
}

type TouchMap = Map<number, TouchPoint>;

function initTouch(canvas: HTMLCanvasElement) {
  const touchMap = new Map<number, TouchPoint>();

  function getTargetClientRect(target: EventTarget) {
    return (target as HTMLElement).getBoundingClientRect();
  }

  function getCoords(touch: Touch, canvas: HTMLCanvasElement, rect: DOMRect) {
    const rawX = touch.clientX - rect.x;
    const scaleX = canvas.width / (rect.right - rect.left);

    const rawY = touch.clientY - rect.y;
    const scaleY = canvas.height / (rect.bottom - rect.top);

    return { x: rawX * scaleX, y: rawY * scaleY };
  }

  function onStartOrMove(event: TouchEvent) {
    event.preventDefault();

    if (!event.target) {
      return;
    }

    const canvas = event.target as HTMLCanvasElement;
    const rect = getTargetClientRect(event.target);

    for (const touch of event.touches) {
      touchMap.set(touch.identifier, getCoords(touch, canvas, rect));
    }
  }

  function onEnd(event: TouchEvent) {
    const touches = [...event.touches].map((it) => it.identifier);
    for (const id of touchMap.keys()) {
      if (!touches.includes(id)) {
        touchMap.delete(id);
      }
    }
  }

  canvas.addEventListener('touchstart', (e) => console.log(e.touches));

  canvas.addEventListener('touchstart', onStartOrMove);
  canvas.addEventListener('touchmove', onStartOrMove);
  canvas.addEventListener('touchend', onEnd);
  canvas.addEventListener('touchcancel', onEnd);

  return touchMap;
}

async function initPixi(pixi: PIXI.Application, touchMap: TouchMap) {
  function createButtonOutline(x: number, y: number) {
    const gfx = new PIXI.Graphics();
    gfx.lineStyle(5, 0x3399ff, 1, 0);
    gfx.beginFill(0, 0);
    gfx.drawRect(0, 0, 100, 100);
    gfx.endFill();

    gfx.x = x * 100;
    gfx.y = y * 100;

    pixi.stage.addChild(gfx);
    return gfx;
  }

  function createTouchMarker() {
    const gfx = new PIXI.Graphics();
    gfx.beginFill(0xff0000, 0.5);
    gfx.drawCircle(0, 0, 15);
    gfx.endFill();
    gfx.visible = true;
    pixi.stage.addChild(gfx);
    console.log(gfx.width, gfx.height);
    return gfx;
  }

  const touchMarkers = new Map<number, PIXI.Graphics>();

  const sprite = PIXI.Sprite.from(startHere);

  sprite.width = 100;
  sprite.height = 100;
  pixi.stage.addChild(sprite);

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

  const buttons = range(4).map((row) =>
    range(4).map((col) => createButtonOutline(col, row)),
  );

  let elapsed = 0.0;

  pixi.ticker.add((delta) => {
    elapsed += delta;
    sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0;

    for (const [id, marker] of touchMarkers) {
      if (!touchMap.has(id)) {
        pixi.stage.removeChild(marker);
        touchMarkers.delete(id);
      }
    }

    for (const [id, touch] of touchMap) {
      if (!touchMarkers.has(id)) {
        touchMarkers.set(id, createTouchMarker());
      }

      const marker = touchMarkers.get(id)!;
      marker.x = touch.x;
      marker.y = touch.y;
    }

    buttons.forEach((row) => row.forEach((it) => (it.visible = false)));
    for (const touch of touchMap.values()) {
      const quadrantX = Math.floor(touch.x / 100);
      const quadrantY = Math.floor(touch.y / 100);

      buttons[quadrantY][quadrantX].visible = true;
    }
  });
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

function repeat<T>(n: number, value: () => T) {
  return Array(n)
    .fill(null)
    .map(() => value());
}
