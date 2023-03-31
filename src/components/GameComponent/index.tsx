import { useEffect, useRef, useState } from 'react';
import { Game } from '../../game';
import { Assets, BeatMap, Song } from '../../game/types';
import styles from './styles.module.css';

export interface GameComponentProps {
  song: Song;
  beatMap: BeatMap;
  audio: HTMLAudioElement;
  assets: Assets;
  onFinish?: () => void;
}

export function GameComponent(props: GameComponentProps) {
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

  const pause = () => {
    gameRef.current?.pause();
  };

  const resume = () => {
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
      <div>
        {score}
        <button onClick={pause}>Pause</button>{' '}
        <button onClick={resume}>Unpause</button>
      </div>
      <div ref={containerRef} className={styles.canvasContainer}></div>
    </main>
  );
}
