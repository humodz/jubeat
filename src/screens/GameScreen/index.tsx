import * as PIXI from 'pixi.js';
import { createRef, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  AppScreen,
  navigate,
  selectBeatmap,
  selectSong,
} from '../../store/appSlice';
import { initPixi } from './pixi';
import styles from './styles.module.css';

export function GameScreen() {
  const dispatch = useAppDispatch();

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
        dispatch(navigate(AppScreen.SONG_LIST));
      },
    });

    return () => {
      promise.finally(() => pixi.destroy());
    };
  }, [dispatch, pixi, song, beatMap]);

  const pause = () => {
    pixi.ticker.stop();
  };

  const unpause = () => {
    pixi.ticker.start();
  };

  if (!song || !beatMap) {
    return <p>ERROR Missing song or beatmap</p>;
  }

  return (
    <main>
      <div>
        {song.songName} {beatMap.difficulty}
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
