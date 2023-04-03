import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { Game } from '../../game';
import { Assets, BeatMap, Song, Voices } from '../../game/types';
import { sleep } from '../../utils';
import styles from './styles.module.css';

export interface GameComponentProps {
  song: Song;
  beatMap: BeatMap;
  audio: HTMLAudioElement;
  assets: Assets;
  voices: Voices;
  onFinish?: () => void;
}

export function GameComponent(props: GameComponentProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const [score, setScore] = useState(0);

  const gameRef = useRef<Game>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element || !props.song || !props.beatMap) {
      return;
    }

    const game = new Game({
      song: props.song,
      beatMap: props.beatMap.data,
      audio: props.audio,
      assets: props.assets,
      onScoreUpdate: setScore,
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

  const pause = () => {
    gameRef.current?.pause();
  };

  const resume = () => {
    gameRef.current?.resume();
  };

  const onAnimationEnd = () => {
    gameRef.current?.resume();
  };

  if (!props.song || !props.beatMap) {
    return <p>ERROR Missing song or beatmap</p>;
  }

  return (
    <main>
      <div>
        {props.song.songName} {props.beatMap.difficulty}
      </div>
      <div>{score}</div>
      <div>
        <button onClick={pause}>Pause</button>{' '}
        <button onClick={resume}>Unpause</button>{' '}
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
