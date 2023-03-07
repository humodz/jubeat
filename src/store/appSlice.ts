import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '.';

export enum AppScreen {
  SONG_LIST = 'song-list',
  GAME = 'game',
}

interface AppState {
  screen: AppScreen;
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
    },
  },
});

export const { navigate } = appSlice.actions;

export const selectScreen = (state: RootState) => state.app.screen;

export const appReducer = appSlice.reducer;
