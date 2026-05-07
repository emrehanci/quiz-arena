import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useQuestionTimer } from '../useQuestionTimer';
import gameReducer, { setActiveQuestion, pauseTimer } from '../../store/gameSlice';
import { mockQuestion } from '../../tests/mockData';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
    preloadedState: initialState,
  });
};

describe('useQuestionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state when no active question', () => {
    const store = createTestStore();
    
    const { result } = renderHook(() => useQuestionTimer(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.isPaused).toBe(false);
  });

  it('should return time remaining from active question', () => {
    const store = createTestStore();
    store.dispatch(setActiveQuestion(mockQuestion));
    
    const { result } = renderHook(() => useQuestionTimer(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    expect(result.current.timeRemaining).toBe(45000);
  });

  it('should pause timer when timerPaused is true', async () => {
    const store = createTestStore();
    store.dispatch(setActiveQuestion(mockQuestion));
    
    const { rerender } = renderHook(() => useQuestionTimer(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
    
    // Pause timer
    store.dispatch(pauseTimer());
    
    // Rerender hook
    rerender();
    
    // Fast-forward time
    vi.advanceTimersByTime(1000);
    
    // Timer should not have decreased significantly (max 100ms from interval timing)
    const timeAfter = store.getState().game.activeQuestion?.timeRemaining;
    expect(timeAfter).toBeGreaterThan(44000); // Should be close to 45000
  });
});
