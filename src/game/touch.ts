import { clear } from '../components/GameScreen/utils';
import { Point } from './types';

export function initTouch(canvas: HTMLCanvasElement) {
  const touchList: Point[] = [];

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

function getTargetClientRect(target: EventTarget) {
  return (target as HTMLElement).getBoundingClientRect();
}

function getCoords(
  touch: Touch,
  canvas: HTMLCanvasElement,
  rect: DOMRect,
): Point {
  const rawX = touch.clientX - rect.x;
  const scaleX = canvas.width / (rect.right - rect.left);

  const rawY = touch.clientY - rect.y;
  const scaleY = canvas.height / (rect.bottom - rect.top);
  return {
    x: rawX * scaleX,
    y: rawY * scaleY,
  };
}
