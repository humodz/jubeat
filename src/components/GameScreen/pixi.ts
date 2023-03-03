import * as PIXI from 'pixi.js';
import * as assets from '../../assets';
import { ButtonPad } from '../../game/ButtonPad';
import { loadMarkers } from '../../game/loaders/marker';
import { initTouch } from '../../game/touch';
import { TouchPointers } from '../../game/TouchPointers';

export async function initPixi(pixi: PIXI.Application<HTMLCanvasElement>) {
  const msg = document.getElementById('msg')!;

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

  let nextIndex = 0;
  let elapsedSecs = 0;

  pixi.ticker.add(() => {
    elapsedSecs += pixi.ticker.deltaMS / 1000;

    while (
      nextIndex < beatMap.length &&
      elapsedSecs >= beatMap[nextIndex].time
    ) {
      for (const button of beatMap[nextIndex].taps) {
        buttonPad.buttons[button].trigger();
      }

      nextIndex++;
    }

    msg.textContent = elapsedSecs.toFixed(0);
    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}

interface BeatMapStep {
  time: number;
  taps: number[];
}

const beatMap: BeatMapStep[] = [
  { time: 3, taps: [0, 15] },
  { time: 3.5, taps: [1, 14] },
  { time: 4, taps: [2, 13] },
  { time: 4.5, taps: [3, 12] },
];
