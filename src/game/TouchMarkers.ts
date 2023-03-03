import * as PIXI from 'pixi.js';
import { repeat } from '../utils';
import { Point } from './types';

export class TouchMarkers {
  node = new PIXI.Container();
  markers: PIXI.Graphics[] = [];

  tick(touchPoints: Point[]) {
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
