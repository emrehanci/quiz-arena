import { describe, it, expect, beforeEach } from 'vitest';
import settingsReducer, {
  addSet,
  importSet,
  deleteSet,
} from '../settingsSlice';
import type { SettingsState, QuizSet } from '../../types';
import { MAX_SETS } from '../../constants';

const mockSet = (id: string, name: string): QuizSet => ({
  id,
  name,
  description: 'Test description',
  finalRoundEnabled: true,
  categories: [],
  finalRoundQuestions: [],
});

describe('settingsSlice', () => {
  let initialState: SettingsState;

  beforeEach(() => {
    initialState = {
      language: 'tr',
      sets: [mockSet('set-1', 'Set 1')],
    };
  });

  describe('addSet', () => {
    it('should add a set when below MAX_SETS limit', () => {
      const state = settingsReducer(initialState, addSet(mockSet('set-2', 'Set 2')));
      expect(state.sets).toHaveLength(2);
      expect(state.sets[1].id).toBe('set-2');
    });

    it('should NOT add a set when MAX_SETS limit (3) is reached', () => {
      let state = settingsReducer(initialState, addSet(mockSet('set-2', 'Set 2')));
      state = settingsReducer(state, addSet(mockSet('set-3', 'Set 3')));
      expect(state.sets).toHaveLength(MAX_SETS);

      // Attempting to add 4th set
      state = settingsReducer(state, addSet(mockSet('set-4', 'Set 4')));
      expect(state.sets).toHaveLength(MAX_SETS);
      expect(state.sets.some(s => s.id === 'set-4')).toBe(false);
    });
  });

  describe('importSet', () => {
    it('should update an existing set even when MAX_SETS is reached', () => {
      let state = settingsReducer(initialState, addSet(mockSet('set-2', 'Set 2')));
      state = settingsReducer(state, addSet(mockSet('set-3', 'Set 3')));
      expect(state.sets).toHaveLength(MAX_SETS);

      // Updating existing set set-2
      const updatedSet2 = mockSet('set-2', 'Set 2 Updated');
      state = settingsReducer(state, importSet(updatedSet2));

      expect(state.sets).toHaveLength(MAX_SETS);
      expect(state.sets.find(s => s.id === 'set-2')?.name).toBe('Set 2 Updated');
    });

    it('should NOT import a new set when MAX_SETS limit is reached', () => {
      let state = settingsReducer(initialState, addSet(mockSet('set-2', 'Set 2')));
      state = settingsReducer(state, addSet(mockSet('set-3', 'Set 3')));
      expect(state.sets).toHaveLength(MAX_SETS);

      state = settingsReducer(state, importSet(mockSet('set-4', 'Set 4')));
      expect(state.sets).toHaveLength(MAX_SETS);
      expect(state.sets.some(s => s.id === 'set-4')).toBe(false);
    });
  });

  describe('deleteSet', () => {
    it('should delete set by id', () => {
      const state = settingsReducer(initialState, deleteSet('set-1'));
      expect(state.sets).toHaveLength(0);
    });
  });
});
