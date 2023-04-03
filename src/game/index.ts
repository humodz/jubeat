import * as PIXI from 'pixi.js';
import { last } from '../utils';
import { ButtonPad } from './ButtonPad';
import {
  BUTTON_SIZE,
  CANVAS_SIZE,
  GAME_END_DELAY_SECONDS,
  GAME_START_DELAY_SECONDS,
  GRID_COLS,
  GRID_ROWS,
  MARKER_DELAY_SECS,
} from './constants';
import { initTouch } from './touch';
import { TouchPointers } from './TouchPointers';
import { Assets, BeatMapStep, Point, Song } from './types';

interface GameProps {
  song: Song;
  beatMap: BeatMapStep[];
  audio: HTMLAudioElement;
  assets: Assets;
  onScoreUpdate?: (score: number) => void;
  onFinish?: () => void;
}

export class Game {
  scoreMap = {
    bad: 0.1,
    good: 0.4,
    great: 0.7,
    perfect: 1.0,
  };

  pixi = new PIXI.Application<HTMLCanvasElement>({
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  });

  buttonPad: ButtonPad;
  touchPointers: TouchPointers;
  touchList: Point[];

  score = 0;
  maxScore: number;
  nextIndex = 0;
  elapsedSecs = -GAME_START_DELAY_SECONDS;
  endTime: number;

  constructor(public props: GameProps) {
    [this.buttonPad, this.touchPointers] = this.initGraphics();
    this.touchList = initTouch(this.pixi.view);

    this.endTime = last(props.beatMap).time + GAME_END_DELAY_SECONDS;
    this.maxScore = props.beatMap
      .map((it) => it.taps.length)
      .reduce((a, b) => a + b, 0);

    this.pixi.ticker.add(() => this.onTick());
    this.resume();
  }

  initGraphics() {
    const buttonPad = new ButtonPad({
      buttonSize: BUTTON_SIZE,
      gridCols: GRID_COLS,
      gridRows: GRID_ROWS,
      assets: this.props.assets,
      onJudgement: (judgement) => {
        this.score += this.scoreMap[judgement];
      },
    });

    buttonPad.startingMarkers(this.props.beatMap[0].taps);

    const touchPointers = new TouchPointers();

    this.pixi.stage.addChild(buttonPad.node);
    this.pixi.stage.addChild(touchPointers.node);

    return [buttonPad, touchPointers] as const;
  }

  onTick() {
    const elapsedSecs = this.props.audio.currentTime;

    if (elapsedSecs === this.props.audio.duration) {
      this.pixi.ticker.stop();
      this.props.onFinish?.();
    }

    const realElapsedSecs =
      elapsedSecs + MARKER_DELAY_SECS + this.props.song.track.lagSeconds;

    while (
      this.nextIndex < this.props.beatMap.length &&
      realElapsedSecs >= this.props.beatMap[this.nextIndex].time
    ) {
      for (const button of this.props.beatMap[this.nextIndex].taps) {
        this.buttonPad.buttons[button].play();
      }

      this.nextIndex++;
    }

    const realScore = Math.floor((1000000 * this.score) / this.maxScore);
    this.props.onScoreUpdate?.(realScore);

    this.buttonPad.tick(this.touchList);
    this.touchPointers.tick(this.touchList);
  }

  pause() {
    this.pixi.ticker.stop();
    this.props.audio.pause();
    this.buttonPad.pause();
  }

  resume() {
    this.pixi.ticker.start();
    this.props.audio.play();
    this.buttonPad.resume();
  }

  destroy() {
    this.props.audio.pause();
    this.pixi.destroy();
  }
}
