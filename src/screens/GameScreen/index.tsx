import * as PIXI from 'pixi.js';
import { createRef, useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../store';
import { selectBeatmap, selectSong } from '../../store/appSlice';
import { initPixi } from './pixi';
import styles from './styles.module.css';

export function GameScreen() {
  const song = useAppSelector(selectSong);
  const beatMap = useAppSelector(selectBeatmap);
  const [score, setScore] = useState(0);

  const pixi = useMemo(
    () =>
      new PIXI.Application<HTMLCanvasElement>({
        width: 400,
        height: 400,
      }),
    [],
  );

  const myRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!myRef.current) {
      return;
    }

    const element = myRef.current;

    element.textContent = '';
    element.append(pixi.view);
  }, [myRef, pixi.view]);

  useEffect(() => {
    if (!song || !beatMap) {
      return;
    }

    const promise = initPixi(pixi, {
      song,
      beatMap: beatMap.data,
      onScoreUpdate: setScore,
      onFinish() {
        /* ... */
      },
    });

    return () => {
      promise.finally(() => pixi.destroy());
    };
  }, [pixi, song, beatMap]);

  if (!song || !beatMap) {
    return <p>ERROR Missing song or beatmap</p>;
  }

  return (
    <main>
      <div>
        {song.songName} {beatMap.difficulty}
      </div>
      <div>{score}</div>
      <div ref={myRef} className={styles.canvasContainer}></div>
    </main>
  );
}
