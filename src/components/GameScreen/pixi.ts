import * as PIXI from 'pixi.js';
import { ButtonPad } from '../../game/ButtonPad';
import { TouchMarkers } from '../../game/TouchMarkers';
import { clear } from './utils';

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

  const buttonPad = new ButtonPad({
    buttonSize: 100,
    gridCols: 4,
    gridRows: 4,
  });
  const touchMarkers = new TouchMarkers();

  pixi.stage.addChild(buttonPad.node);
  pixi.stage.addChild(touchMarkers.node);

  pixi.ticker.add(() => {
    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}
