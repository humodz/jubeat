import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '.';
import { BeatMap, Song } from '../types';

export enum AppScreen {
  SONG_LIST = 'song-list',
  GAME = 'game',
}

interface AppState {
  screen: AppScreen;

  song?: Song;
  beatMap?: BeatMap;
}

const initialState: AppState = {
  screen: AppScreen.SONG_LIST,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    navigate(state, action: PayloadAction<AppScreen>) {
      state.screen = action.payload;
      state.song = undefined;
      state.beatMap = undefined;
    },
    playSong(state, action: PayloadAction<{ song: Song; beatMap: BeatMap }>) {
      // state.screen = AppScreen.LOADING_GAME;
      state.song = action.payload.song;
      state.beatMap = action.payload.beatMap;
    },
  },
});

export const { navigate, playSong } = appSlice.actions;

export const selectScreen = (state: RootState) => state.app.screen;
export const selectSong = (state: RootState) => state.app.song;
export const selectBeatmap = (state: RootState) => state.app.beatMap;

export const appReducer = appSlice.reducer;
