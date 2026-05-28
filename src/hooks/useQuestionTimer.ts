import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './useAppStore';
import { updateTimeRemaining } from '../store/gameSlice';
import { soundService } from '../utils/soundService';

/**
 * Custom hook for managing question timer
 */
export const useQuestionTimer = () => {
  const dispatch = useAppDispatch();
  const activeQuestion = useAppSelector(state => state.game.activeQuestion);
  const intervalRef = useRef<number | null>(null);
  const clockSoundPlayedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!activeQuestion || activeQuestion.timerPaused) {
      // Clear interval if no active question or timer is paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Reset clock sound flag when new question starts
    clockSoundPlayedRef.current = false;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start timer interval
    intervalRef.current = window.setInterval(() => {
      const newTime = Math.max(0, (activeQuestion.timeRemaining || 0) - 100);
      dispatch(updateTimeRemaining(newTime));
      
      // Play clock sound when time reaches 8 seconds (8000ms)
      if (newTime <= 8000 && newTime > 7900 && !clockSoundPlayedRef.current) {
        soundService.playClock();
        clockSoundPlayedRef.current = true;
      }
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
