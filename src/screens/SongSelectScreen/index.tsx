import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { ChangeEvent, useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { SearchInput } from '../../components/SearchInput';
import { SongSummary } from '../../components/SongSummary';
import { SongInfo } from '../../types';
import { by, fetchJson, intlCompare } from '../../utils';

interface SongSelectScreenProps {
  onSelect?: (song: SongInfo) => void;
}

export function SongSelectScreen(props: SongSelectScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const onInputChange = useMemo(() => {
    return debounce((event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value.trim());
    }, 300);
  }, []);

  const { songs, query } = useSongSearch(searchTerm);

  if (query.status === 'loading') {
    return <p>Loading...</p>;
  }

  if (query.status === 'error') {
    return <p>ERROR {getErrorMessage(query)}</p>;
  }

  return (
    <>
      <SearchInput onChange={onInputChange} />
      {songs.map((song) => (
        <SongSummary
          key={song.id}
          song={song}
          onClick={() => props.onSelect?.(song)}
        />
      ))}
    </>
  );
}

function useSongSearch(searchTerm: string) {
  const songsQuery = useQuery('songs', getSongs);

  const fuse = useMemo(() => {
    if (songsQuery.status !== 'success') {
      return new Fuse([]);
    } else {
      return new Fuse(songsQuery.data, {
        keys: ['title.romaji', 'title.original'],
      });
    }
  }, [songsQuery]);

  const songs = useMemo(() => {
    if (songsQuery.status !== 'success') {
      return [];
    }

    if (!searchTerm) {
      return songsQuery.data;
    }

    return fuse.search(searchTerm).map((it) => it.item);
  }, [fuse, searchTerm, songsQuery]);

  return { songs, query: songsQuery };
}

async function getSongs() {
  const [allSongs, trackMap] = await Promise.all([
    fetchJson<SongInfo[]>('game-data/songs.json'),
    fetchJson<Record<string, string>>('game-data/track-map.json'),
  ]);

  return allSongs
    .filter((song) => song.levels.some((level) => level.beatMapUrl !== null))
    .map((song) => ({ ...song, trackUrl: trackMap[song.id] }))
    .sort(by((it) => it.title.romaji || it.title.original, intlCompare));
}

function getErrorMessage(query: { error: unknown }) {
  return (query.error as any)?.message || 'Unknown error';
}
