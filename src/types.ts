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
}

export interface SongLevel {
  level: number;
  difficulty: string;
  notes: string;
  beatMapUrl: string | null;
}
