import * as PIXI from 'pixi.js';
import { ButtonPad } from '../../game/ButtonPad';
import { initTouch } from '../../game/touch';
import { TouchMarkers } from '../../game/TouchMarkers';

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
