import * as PIXI from 'pixi.js';
import * as assets from '../../assets';
import kimiWoNosete from '../../game-data/kimi-wo-nosete.beatmap.json';
import { ButtonPad } from '../../game/ButtonPad';
import { loadMarkers } from '../../game/loaders/marker';
import { initTouch } from '../../game/touch';
import { TouchPointers } from '../../game/TouchPointers';

const beatMap = kimiWoNosete;

export async function initPixi(pixi: PIXI.Application<HTMLCanvasElement>) {
  await sleep(3000);
  const audio = new Audio('/game-data/kimi-wo-nosete.mp3');
  audio.volume = 0.2;

  await audio.play();
  audio.pause();

  const audioStartTime = 1;

  const msg = document.getElementById('msg')!;

  const scoreMap = {
    bad: 0.1,
    good: 0.4,
    great: 0.7,
    perfect: 1.0,
  };

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
      great: good.animations.animated,
      perfect: perfect.animations.animated,
    },
    onJudgement(judgement) {
      score += scoreMap[judgement];
    },
  });

  const touchMarkers = new TouchPointers();

  pixi.stage.addChild(buttonPad.node);
  pixi.stage.addChild(touchMarkers.node);

  const delayMs = (800 / 25) * 15;
  let nextIndex = 0;
  let elapsedSecs = -(delayMs / 1000) - 1;
  let score = 0;

  const maxScore = beatMap
    .map((it) => it.taps.length)
    .reduce((a, b) => a + b, 0);

  pixi.ticker.add(() => {
    elapsedSecs += pixi.ticker.deltaMS / 1000;

    if (elapsedSecs >= audioStartTime && audio.paused) {
      audio.play();
      console.log('playing');
    }

    while (
      nextIndex < beatMap.length &&
      elapsedSecs >= beatMap[nextIndex].time
    ) {
      for (const button of beatMap[nextIndex].taps) {
        buttonPad.buttons[button].play();
      }

      nextIndex++;
    }

    const realScore = Math.floor((1000000 * score) / maxScore);
    msg.textContent = `t=${elapsedSecs.toFixed(0)} s=${realScore}`;
    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}

interface BeatMapStep {
  time: number;
  taps: number[];
}

const helloWorldBeatMap: BeatMapStep[] = [
  { time: 2, taps: [5] },
  { time: 2.5, taps: [6] },
  { time: 3, taps: [10] },
  { time: 3.5, taps: [9] },

  { time: 4, taps: [5] },
  { time: 4.5, taps: [6] },
  { time: 5, taps: [10] },
  { time: 5.5, taps: [9] },

  { time: 6, taps: [5] },
  { time: 6.5, taps: [6] },
  { time: 7, taps: [10] },
  { time: 7.5, taps: [9] },
];

async function sleep(ms: number) {
  return new Promise((ok) => setTimeout(ok, ms));
}
