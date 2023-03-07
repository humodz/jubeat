export interface Song {
  songName: string;
  author: string;
  beatMaps: Record<Difficulty, BeatMap | null>;
}

export enum Difficulty {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED',
  EXTREME = 'EXTREME',
}

export interface BeatMap {
  difficulty: Difficulty;
  level: number;
  data: BeatMapStep[];
}

export interface BeatMapStep {
  time: number;
  taps: number[];
}
