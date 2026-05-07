import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { updateTimeRemaining } from '../store/gameSlice';

/**
 * Custom hook for managing question timer
 */
export const useQuestionTimer = () => {
  const dispatch = useAppDispatch();
  const activeQuestion = useAppSelector(state => state.game.activeQuestion);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeQuestion || activeQuestion.timerPaused) {
      // Clear interval if no active question or timer is paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start timer interval
    intervalRef.current = window.setInterval(() => {
      dispatch(updateTimeRemaining(Math.max(0, (activeQuestion.timeRemaining || 0) - 100)));
    }, 100); // Update every 100ms for smooth countdown

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [activeQuestion, dispatch]);

  return {
    timeRemaining: activeQuestion?.timeRemaining || 0,
    isPaused: activeQuestion?.timerPaused || false,
  };
};
