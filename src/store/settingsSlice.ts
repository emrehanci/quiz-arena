import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { SettingsState, QuizSet } from '../types';
import { DEFAULT_LANGUAGE } from '../constants';
import { SetService } from '../services/setService';

const initialState: SettingsState = {
  language: DEFAULT_LANGUAGE,
  sets: [SetService.createSampleSet()], // Include sample set by default
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    addSet: (state, action: PayloadAction<QuizSet>) => {
      state.sets.push(action.payload);
    },

    updateSet: (state, action: PayloadAction<QuizSet>) => {
      const index = state.sets.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sets[index] = action.payload;
      }
    },

    deleteSet: (state, action: PayloadAction<string>) => {
      state.sets = state.sets.filter(s => s.id !== action.payload);
    },

    importSet: (state, action: PayloadAction<QuizSet>) => {
      // Check if set with same ID exists
      const existingIndex = state.sets.findIndex(s => s.id === action.payload.id);
      if (existingIndex !== -1) {
        // Update existing
        state.sets[existingIndex] = action.payload;
      } else {
        // Add new
        state.sets.push(action.payload);
      }
    },
  },
});

export const { setLanguage, addSet, updateSet, deleteSet, importSet } = settingsSlice.actions;

export default settingsSlice.reducer;
