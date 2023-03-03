import * as PIXI from 'pixi.js';
import { clear, range, repeat } from './utils';

interface TouchPoint {
  x: number;
  y: number;
}

function initTouch(canvas: HTMLCanvasElement) {
  const touchList: TouchPoint[] = [];

  function getTargetClientRect(target: EventTarget) {
    return (target as HTMLElement).getBoundingClientRect();
  }

  function getCoords(
    touch: Touch,
    canvas: HTMLCanvasElement,
    rect: DOMRect,
  ): TouchPoint {
    const rawX = touch.clientX - rect.x;
    const scaleX = canvas.width / (rect.right - rect.left);

    const rawY = touch.clientY - rect.y;
    const scaleY = canvas.height / (rect.bottom - rect.top);
    return {
      x: rawX * scaleX,
      y: rawY * scaleY,
    };
  }

  function updateTouchList(event: TouchEvent) {
    if (!event.target) {
      return;
    }
    clear(touchList);
    const rect = getTargetClientRect(event.target);
    for (const touch of event.touches) {
      touchList.push(getCoords(touch, event.target as any, rect));
    }
  }

  canvas.addEventListener('touchstart', updateTouchList);
  canvas.addEventListener('touchmove', updateTouchList);
  canvas.addEventListener('touchend', updateTouchList);
  canvas.addEventListener('touchcancel', updateTouchList);

  return touchList;
}

export async function initPixi(pixi: PIXI.Application<HTMLCanvasElement>) {
  const touchList = initTouch(pixi.view);

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
    gfx.drawCircle(0, 0, 20);
    gfx.endFill();
    gfx.visible = true;
    pixi.stage.addChild(gfx);
    return gfx;
  }

  const touchMarkers: PIXI.Graphics[] = [];

  const buttons = range(4).map((row) =>
    range(4).map((col) => createButtonOutline(col, row)),
  );

  pixi.ticker.add(() => {
    if (touchMarkers.length < touchList.length) {
      const amount = touchList.length - touchMarkers.length;
      const newMarkers = repeat(amount, () => createTouchMarker());
      touchMarkers.push(...newMarkers);
    }

    touchMarkers.forEach((marker, i) => {
      if (i >= touchList.length) {
        marker.visible = false;
      } else {
        marker.visible = true;
        const touch = touchList[i];
        marker.x = touch.x;
        marker.y = touch.y;
      }
    });

    buttons.forEach((row) => row.forEach((it) => (it.visible = false)));
    for (const touch of touchList) {
      const quadrantX = Math.floor(touch.x / 100);
      const quadrantY = Math.floor(touch.y / 100);

      buttons[quadrantY][quadrantX].visible = true;
    }
  });
}
