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

class TouchMarkers {
  node = new PIXI.Container();
  markers: PIXI.Graphics[] = [];

  tick(touchPoints: TouchPoint[]) {
    if (this.markers.length < touchPoints.length) {
      const amount = touchPoints.length - this.markers.length;
      const newMarkers = repeat(amount, () => this.createTouchMarker());
      this.markers.push(...newMarkers);
      this.node.addChild(...newMarkers);
    }

    this.markers.forEach((marker, i) => {
      if (i >= touchPoints.length) {
        marker.visible = false;
      } else {
        marker.visible = true;
        const touch = touchPoints[i];
        marker.x = touch.x;
        marker.y = touch.y;
      }
    });
  }

  createTouchMarker() {
    return new PIXI.Graphics()
      .beginFill(0xff0000, 0.5)
      .drawCircle(0, 0, 20)
      .endFill();
  }
}

interface ButtonPadProps {
  buttonSize: number;
  gridRows: number;
  gridCols: number;
}
class ButtonPad {
  node = new PIXI.Container();
  buttons: GameButton[];

  constructor(public props: ButtonPadProps) {
    this.buttons = range(props.gridCols * props.gridRows).map(
      (i) =>
        new GameButton({
          size: props.buttonSize,
          x: props.buttonSize * (i % props.gridCols),
          y: props.buttonSize * Math.floor(i / props.gridCols),
        }),
    );

    this.node.addChild(...this.buttons.map((it) => it.node));
  }

  tick(touchPoints: TouchPoint[]) {
    const isTouched = repeat(this.buttons.length, () => false);

    for (const touch of touchPoints) {
      const r = 10;
      this.checkIsTouched(isTouched, touch.x - r, touch.y - r);
      this.checkIsTouched(isTouched, touch.x - r, touch.y + r);
      this.checkIsTouched(isTouched, touch.x + r, touch.y - r);
      this.checkIsTouched(isTouched, touch.x + r, touch.y + r);
    }

    this.buttons.forEach((it, i) => {
      it.showOutline(isTouched[i]);
    });
  }

  checkIsTouched(isTouched: boolean[], x: number, y: number) {
    const quadrantX = Math.floor(x / this.props.buttonSize);
    const quadrantY = Math.floor(y / this.props.buttonSize);

    if (
      quadrantX < 0 ||
      quadrantX >= this.props.gridCols ||
      quadrantY < 0 ||
      quadrantY >= this.props.gridRows
    ) {
      return;
    }

    isTouched[quadrantX + quadrantY * this.props.gridCols] = true;
  }
}

interface GameButtonProps {
  size: number;
  x: number;
  y: number;
}
class GameButton {
  node = new PIXI.Container();
  outline = new PIXI.Graphics();

  constructor(public props: GameButtonProps) {
    this.node.x = props.x;
    this.node.y = props.y;

    this.outline
      .lineStyle(5, 0x3399ff, 1, 0)
      .beginFill(0, 0)
      .drawRect(0, 0, props.size, props.size)
      .endFill();

    this.node.addChild(this.outline);
  }

  showOutline(visible: boolean) {
    this.outline.visible = visible;
  }
}
