import * as PIXI from 'pixi.js';
import { createRef, useEffect } from 'react';
import { initPixi } from './pixi';
import styles from './styles.module.css';

export function GameScreen() {
  const myRef = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!myRef.current) {
      return;
    }

    const element = myRef.current;

    const pixi = new PIXI.Application<HTMLCanvasElement>({
      width: 400,
      height: 400,
    });

    element.textContent = '';
    element.append(pixi.view);

    const promise = initPixi(pixi);

    return () => {
      promise.finally(() => pixi.destroy());
    };
  }, [myRef]);

  return <div ref={myRef} className={styles.canvasContainer}></div>;
}
