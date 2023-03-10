export interface Song {
  songName: string;
  author: string;
  track: Track;
  beatMaps: Record<Level, BeatMap | null>;
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
