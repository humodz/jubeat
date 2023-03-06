import * as PIXI from 'pixi.js';
import { repeat } from '../utils';
import { Point } from './types';

export class TouchPointers {
  node = new PIXI.Container();
  pointers: PIXI.Graphics[] = [];

  tick(touchPoints: Point[]) {
    if (this.pointers.length < touchPoints.length) {
      const amount = touchPoints.length - this.pointers.length;
      const newPointers = repeat(amount, () => this.createTouchPointer());
      this.pointers.push(...newPointers);
      this.node.addChild(...newPointers);
    }

    this.pointers.forEach((pointer, i) => {
      if (i >= touchPoints.length) {
        pointer.visible = false;
      } else {
        pointer.visible = true;
        const touch = touchPoints[i];
        pointer.x = touch.x;
        pointer.y = touch.y;
      }
    });
  }

  createTouchPointer() {
    return new PIXI.Graphics()
      .beginFill(0xffffff, 0.5)
      .drawCircle(0, 0, 20)
      .endFill();
  }
}
