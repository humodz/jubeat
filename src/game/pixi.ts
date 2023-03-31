import * as PIXI from 'pixi.js';
import { last } from '../utils';
import { ButtonPad } from './ButtonPad';
import {
  BUTTON_SIZE,
  GRID_COLS,
  GRID_ROWS,
  MARKER_DELAY_SECS,
} from './constants';
import { initTouch } from './touch';
import { TouchPointers } from './TouchPointers';
import { Assets, BeatMapStep, Song } from './types';

interface InitPixiProps {
  song: Song;
  beatMap: BeatMapStep[];
  audio: HTMLAudioElement;
  assets: Assets;
  onScoreUpdate?: (score: number) => void;
  onFinish?: () => void;
}

export function initPixi(
  pixi: PIXI.Application<HTMLCanvasElement>,
  props: InitPixiProps,
) {
  const scoreMap = {
    bad: 0.1,
    good: 0.4,
    great: 0.7,
    perfect: 1.0,
  };

  const touchList = initTouch(pixi.view);

  const buttonPad = new ButtonPad({
    buttonSize: BUTTON_SIZE,
    gridCols: GRID_COLS,
    gridRows: GRID_ROWS,
    assets: props.assets,
    onJudgement(judgement) {
      score += scoreMap[judgement];
    },
  });

  const touchMarkers = new TouchPointers();

  pixi.stage.addChild(buttonPad.node);
  pixi.stage.addChild(touchMarkers.node);

  const delaySecs = MARKER_DELAY_SECS;
  const audioLagSecs = props.song.track.lagSeconds;

  let nextIndex = 0;
  let elapsedSecs = -1;
  let score = 0;
  let audioStarted = false;

  const endTime = last(props.beatMap).time + 2;

  const maxScore = props.beatMap
    .map((it) => it.taps.length)
    .reduce((a, b) => a + b, 0);

  pixi.ticker.add(() => {
    elapsedSecs += pixi.ticker.deltaMS / 1000;

    if (elapsedSecs >= 0 && !audioStarted) {
      audioStarted = true;
      props.audio.play();
    }

    if (elapsedSecs >= endTime) {
      props.audio.pause();
      pixi.ticker.stop();
      props.onFinish?.();
    }

    while (
      nextIndex < props.beatMap.length &&
      elapsedSecs + delaySecs + audioLagSecs >= props.beatMap[nextIndex].time
    ) {
      for (const button of props.beatMap[nextIndex].taps) {
        buttonPad.buttons[button].play();
      }

      nextIndex++;
    }

    const realScore = Math.floor((1000000 * score) / maxScore);
    props.onScoreUpdate?.(realScore);

    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}
