import * as PIXI from 'pixi.js';
import { last } from '../utils';
import { ButtonPad } from './ButtonPad';
import { initTouch } from './touch';
import { TouchPointers } from './TouchPointers';
import { Assets, BeatMapStep, Song } from './types';

interface InitPixiArgs {
  song: Song;
  beatMap: BeatMapStep[];
  trackBlobUrl: string;
  assets: Assets;
  onScoreUpdate?: (score: number) => void;
  onFinish?: () => void;
}

export function initPixi(
  pixi: PIXI.Application<HTMLCanvasElement>,
  args: InitPixiArgs,
) {
  const audio = new Audio(args.trackBlobUrl);
  audio.volume = args.song.track.volume;

  const scoreMap = {
    bad: 0.1,
    good: 0.4,
    great: 0.7,
    perfect: 1.0,
  };

  const touchList = initTouch(pixi.view);

  const buttonPad = new ButtonPad({
    buttonSize: 100,
    gridCols: 4,
    gridRows: 4,
    assets: args.assets,
    onJudgement(judgement) {
      score += scoreMap[judgement];
    },
  });

  const touchMarkers = new TouchPointers();

  pixi.stage.addChild(buttonPad.node);
  pixi.stage.addChild(touchMarkers.node);

  const delaySecs = (0.8 / 25) * 15;
  const audioLagSeconds = args.song.track.lagSeconds;

  let nextIndex = 0;
  let elapsedSecs = -1;
  let score = 0;
  let audioStarted = false;

  const endTime = last(args.beatMap).time + 2;

  const maxScore = args.beatMap
    .map((it) => it.taps.length)
    .reduce((a, b) => a + b, 0);

  pixi.ticker.add(() => {
    elapsedSecs += pixi.ticker.deltaMS / 1000;

    if (elapsedSecs >= 0 && !audioStarted) {
      audioStarted = true;
      audio.play();
    }

    if (elapsedSecs >= endTime) {
      audio.pause();
      pixi.ticker.stop();
      args.onFinish?.();
    }

    while (
      nextIndex < args.beatMap.length &&
      elapsedSecs + delaySecs + audioLagSeconds >= args.beatMap[nextIndex].time
    ) {
      for (const button of args.beatMap[nextIndex].taps) {
        buttonPad.buttons[button].play();
      }

      nextIndex++;
    }

    const realScore = Math.floor((1000000 * score) / maxScore);
    args.onScoreUpdate?.(realScore);

    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}
