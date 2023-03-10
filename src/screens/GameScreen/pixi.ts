import * as PIXI from 'pixi.js';
import * as assets from '../../assets';
import { ButtonPad } from '../../game/ButtonPad';
import { loadMarkers } from '../../game/loaders/marker';
import { initTouch } from '../../game/touch';
import { TouchPointers } from '../../game/TouchPointers';
import { BeatMapStep, Song } from '../../types';

interface InitPixiArgs {
  song: Song;
  beatMap: BeatMapStep[];
  onScoreUpdate: (score: number) => void;
  onFinish: () => void;
}

export async function initPixi(
  pixi: PIXI.Application<HTMLCanvasElement>,
  { song, beatMap, onScoreUpdate }: InitPixiArgs,
) {
  const audio = new Audio(song.track.url);
  audio.volume = song.track.volume;

  await audio.play();
  audio.pause();

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

  const delaySecs = (0.8 / 25) * 15;
  const audioLagSeconds = song.track.lagSeconds;

  let nextIndex = 0;
  let elapsedSecs = -1;
  let score = 0;
  let audioStarted = false;

  const maxScore = beatMap
    .map((it) => it.taps.length)
    .reduce((a, b) => a + b, 0);

  pixi.ticker.add(() => {
    elapsedSecs += pixi.ticker.deltaMS / 1000;

    if (elapsedSecs >= 0 && !audioStarted) {
      audioStarted = true;
      audio.play();
    }

    while (
      nextIndex < beatMap.length &&
      elapsedSecs + delaySecs + audioLagSeconds >= beatMap[nextIndex].time
    ) {
      for (const button of beatMap[nextIndex].taps) {
        buttonPad.buttons[button].play();
      }

      nextIndex++;
    }

    const realScore = Math.floor((1000000 * score) / maxScore);
    onScoreUpdate(realScore);

    buttonPad.tick(touchList);
    touchMarkers.tick(touchList);
  });
}
