import * as PIXI from 'pixi.js';
import * as assets from '../../assets';
import { ButtonPad } from '../../game/ButtonPad';
import { loadMarkers } from '../../game/loaders/marker';
import { initTouch } from '../../game/touch';
import { TouchPointers } from '../../game/TouchPointers';

export async function initPixi(pixi: PIXI.Application<HTMLCanvasElement>) {
  const touchList = initTouch(pixi.view);

  const [marker, bad, good, perfect] = await loadMarkers([
    assets.marker,
    assets.bad,
    assets.good,
    assets.perfect,
  ]);

  const buttonPad = new ButtonPad({
    buttonSize: 100,
    gridCols: 4,
    gridRows: 4,
    assets: {
      marker: marker.animations.animated,
      bad: bad.animations.animated,
      good: good.animations.animated,
      perfect: perfect.animations.animated,
    },
  });

  const touchMarkers = new TouchPointers();

  pixi.stage.addChild(buttonPad.node);
  pixi.stage.addChild(touchMarkers.node);

  pixi.ticker.add(() => {
    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}
