import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Game } from '../../game';
import { Assets, BeatMap, Voices } from '../../game/types';
import { SongInfo } from '../../types';
import { sleep } from '../../utils';
import styles from './styles.module.css';

export interface GameContainerProps {
  song: SongInfo;
  beatMap: BeatMap;
  audio: HTMLAudioElement;
  assets: Assets;
  voices: Voices;
  onFinish?: () => void;
}

export function GameContainer(props: GameContainerProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  const gameRef = useRef<Game>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const game = new Game({
      song: props.song,
      beatMap: props.beatMap.data,
      audio: props.audio,
      assets: props.assets,
      onScoreUpdate: (score, combo) => {
        setScore(score);
        setCombo(combo);
      },
      onFinish: props.onFinish,
    });

    gameRef.current = game;

    element.textContent = '';
    element.append(game.pixi.view);

    return () => game.destroy();
  }, [props]);

  useEffect(() => {
    async function run() {
      await sleep(1000);
      setIsAnimated(true);
      props.voices.ready.play();

      await sleep(1500);
      props.voices.go.play();
    }

    run();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePause = () => {
    if (isPaused) {
      gameRef.current?.resume();
    } else {
      gameRef.current?.pause();
    }
    setIsPaused((it) => !it);
  };

  const onAnimationEnd = () => {
    gameRef.current?.resume();
  };

  return (
    <main>
      <div>
        Score: {score} | Combo: {combo}
      </div>
      <div>
        <button onClick={togglePause}>{!isPaused ? 'Pause' : 'Unpause'}</button>
      </div>
      <div style={{ position: 'relative' }}>
        <div ref={containerRef} className={styles.canvasContainer}></div>
        <div className={styles.overlay}>
          <div
            className={clsx(styles.announcement, isAnimated && styles.readyGo)}
            onAnimationEnd={onAnimationEnd}
          ></div>
        </div>
      </div>
    </main>
  );
}
