import * as PIXI from 'pixi.js';
import { useEffect, useRef, useState } from 'react';
import { CANVAS_SIZE } from '../../game/constants';
import { initPixi } from '../../game/pixi';
import { Assets, BeatMap, Song } from '../../game/types';
import styles from './styles.module.css';

export interface GameSessionProps {
  song: Song;
  beatMap: BeatMap;
  audio: HTMLAudioElement;
  assets: Assets;
  onFinish?: () => void;
}

type PixiApp = PIXI.Application<HTMLCanvasElement>;
const PixiApp = PIXI.Application<HTMLCanvasElement>;

export function GameSession(props: GameSessionProps) {
  const [score, setScore] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const pixiRef = useRef<PixiApp>();
  const getPixi = () => pixiRef.current!;

  useEffect(() => {
    const element = containerRef.current;

    if (!element || !props.song || !props.beatMap) {
      return;
    }

    const pixi = new PixiApp({ width: CANVAS_SIZE, height: CANVAS_SIZE });
    pixiRef.current = pixi;

    element.textContent = '';
    element.append(pixi.view);

    initPixi(pixi, {
      song: props.song,
      beatMap: props.beatMap.data,
      audio: props.audio,
      assets: props.assets,
      onScoreUpdate: setScore,
      onFinish: props.onFinish,
    });

    return () => pixi.destroy();
  }, [props]);

  const pause = () => {
    getPixi().ticker.stop();
  };

  const unpause = () => {
    getPixi().ticker.start();
  };

  if (!props.song || !props.beatMap) {
    return <p>ERROR Missing song or beatmap</p>;
  }

  return (
    <main>
      <div>
        {props.song.songName} {props.beatMap.difficulty}
      </div>
      <div>
        {score}
        <button onClick={pause}>Pause</button>{' '}
        <button onClick={unpause}>Unpause</button>
      </div>
      <div ref={containerRef} className={styles.canvasContainer}></div>
    </main>
  );
}
