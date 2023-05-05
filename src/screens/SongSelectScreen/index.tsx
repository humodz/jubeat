import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { ChangeEvent, useMemo, useState } from 'react';
import { SearchInput } from '../../components/SearchInput';
import { SongSummary } from '../../components/SongSummary';
import { SongInfo } from '../../types';
import { by, intlCompare } from '../../utils';
import { useLoader } from '../../utils/hooks';

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
    return <p>ERROR {query.error.message}</p>;
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
  const songsQuery = useLoader(async () => {
    const response = await fetch('game-data/songs.json');
    const allSongs = (await response.json()) as SongInfo[];

    return allSongs
      .filter((song) => song.levels.some((level) => level.beatMapUrl !== null))
      .sort(by((it) => it.title.romaji || it.title.original, intlCompare));
  });

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
