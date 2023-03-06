import * as PIXI from 'pixi.js';
import { range, repeat } from '../utils';
import { GameButton } from './GameButton';
import { Point } from './types';

export interface ButtonPadProps {
  buttonSize: number;
  gridRows: number;
  gridCols: number;

  assets: {
    marker: PIXI.Texture[];
    bad: PIXI.Texture[];
    good: PIXI.Texture[];
    great: PIXI.Texture[];
    perfect: PIXI.Texture[];
  };

  onJudgement(judgement: 'bad' | 'good' | 'great' | 'perfect'): void;
}

export class ButtonPad {
  node = new PIXI.Container();
  buttons: GameButton[];
  pressedBefore: boolean[] = [];

  constructor(public props: ButtonPadProps) {
    this.buttons = range(props.gridCols * props.gridRows).map(
      (i) =>
        new GameButton({
          size: props.buttonSize,
          x: props.buttonSize * (i % props.gridCols),
          y: props.buttonSize * Math.floor(i / props.gridCols),
          assets: props.assets,
        }),
    );

    this.pressedBefore = repeat(this.buttons.length, () => false);

    this.node.addChild(...this.buttons.map((it) => it.node));
  }

  tick(touchPoints: Point[]) {
    const isPressed = repeat(this.buttons.length, () => false);

    for (const touch of touchPoints) {
      const r = 10;
      this.checkIsTouched(isPressed, touch.x - r, touch.y - r);
      this.checkIsTouched(isPressed, touch.x - r, touch.y + r);
      this.checkIsTouched(isPressed, touch.x + r, touch.y - r);
      this.checkIsTouched(isPressed, touch.x + r, touch.y + r);
    }

    this.buttons.forEach((it, i) => {
      it.showOutline(isPressed[i]);
    });

    isPressed.forEach((_, i) => {
      if (isPressed[i] && !this.pressedBefore[i]) {
        const judgement = this.buttons[i].press();

        if (judgement !== null) {
          this.props.onJudgement(judgement);
        }
      }
    });

    this.pressedBefore = isPressed;
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
