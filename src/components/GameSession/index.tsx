import * as PIXI from 'pixi.js';
import { createRef, useEffect, useRef, useState } from 'react';
import { initPixi } from '../../game/pixi';
import { BeatMap, Song } from '../../game/types';
import styles from './styles.module.css';

export interface GameSessionProps {
  song: Song;
  beatMap: BeatMap;
  onFinish?: () => void;
}

type PixiApp = PIXI.Application<HTMLCanvasElement>;
const PixiApp = PIXI.Application<HTMLCanvasElement>;

export function GameSession(props: GameSessionProps) {
  const [score, setScore] = useState(0);

  const myRef = createRef<HTMLDivElement>();

  const pixi = useInit(
    () =>
      new PixiApp({
        width: 400,
        height: 400,
      }),
  );

  useEffect(() => {
    if (!myRef.current) {
      return;
    }

    const element = myRef.current;

    element.textContent = '';
    element.append(pixi.view);
  }, [myRef, pixi]);

  useEffect(() => {
    if (!props.song || !props.beatMap) {
      return;
    }

    const promise = initPixi(pixi, {
      song: props.song,
      beatMap: props.beatMap.data,
      onScoreUpdate: setScore,
      onFinish() {
        props.onFinish?.();
      },
    });

    return () => {
      promise.finally(() => pixi.destroy());
    };
  }, [pixi, props]);

  const pause = () => {
    pixi.ticker.stop();
  };

  const unpause = () => {
    pixi.ticker.start();
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
      <div ref={myRef} className={styles.canvasContainer}></div>
    </main>
  );
}

function useInit<T>(factory: () => T): T {
  const initialized = useRef(false);
  const ref = useRef<T>();

  if (!initialized.current) {
    initialized.current = true;
    ref.current = factory();
  }

  return ref.current!;
}
