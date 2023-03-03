import * as PIXI from 'pixi.js';
import { range, repeat } from '../utils';
import { GameButton } from './GameButton';
import { Point } from './types';

export interface ButtonPadProps {
  buttonSize: number;
  gridRows: number;
  gridCols: number;
}

export class ButtonPad {
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

  tick(touchPoints: Point[]) {
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
