// Game constants
export const QUESTION_DURATION = 45000; // 45 seconds in milliseconds
export const MAX_CONSECUTIVE_CORRECT = 3;
export const MAX_WRONG_ATTEMPTS = 2;
export const TOTAL_CATEGORIES = 10;
export const POINT_VALUES = [100, 200, 300, 400, 500] as const;
export const OPTION_COUNT = 4;

// Final Round constants
export const FINAL_ROUND_QUESTION_COUNT = 5;
export const FINAL_ROUND_DURATION = 45000; // 45 seconds

// Final Round scoring
export const FINAL_ROUND_POINTS = {
  1: 1000,
  2: 750,
  3: 500,
  4: 100,
} as const;

// Local storage keys
export const STORAGE_KEY = 'quiz-arena-state';

// Default language
export const DEFAULT_LANGUAGE = 'tr';

// Supported languages
export const SUPPORTED_LANGUAGES = ['tr', 'en', 'de'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
