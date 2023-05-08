export interface SongInfo {
  id: string;
  title: {
    original: string;
    romaji: string | null;
  };
  artist: string;
  bpm: number;
  jacketUrl: string | null;
  levels: SongLevel[];
  track?: SongTrack;
}
export interface SongLevel {
  level: number;
  difficulty: string;
  notes: string;
  beatMapUrl: string | null;
}

export interface SongTrack {
  url: string;
  volume: number;
  lagSeconds: number;
}
