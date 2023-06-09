import * as PIXI from 'pixi.js';

export interface Point {
  x: number;
  y: number;
}
export interface Track {
  url: string;
  volume: number;
  lagSeconds: number;
}

export enum Level {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  EXTREME = 'EXTREME',
}

export interface BeatMap {
  difficulty: number;
  data: BeatMapStep[];
}

export interface BeatMapStep {
  time: number;
  taps: number[];
}
export interface Assets {
  startHere: PIXI.Texture;
  marker: PIXI.Texture[];
  bad: PIXI.Texture[];
  good: PIXI.Texture[];
  great: PIXI.Texture[];
  perfect: PIXI.Texture[];
}

export interface Voices {
  ready: HTMLAudioElement;
  go: HTMLAudioElement;
}
