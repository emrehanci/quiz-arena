import { v4 as uuidv4 } from 'uuid';
import type { Team, Jokers } from '../types';

/**
 * Creates a new team with default values
 */
export const createTeam = (name: string): Team => {
  return {
    id: uuidv4(),
    name,
    score: 0,
    consecutiveCorrectCount: 0,
    jokers: {
      fiftyFiftyUsed: false,
      transferUsed: false,
      shieldUsed: false,
    },
    jokersUsedThisTurn: 0,
  };
};

/**
 * Resets team jokers
 */
export const resetJokers = (): Jokers => {
  return {
    fiftyFiftyUsed: false,
    transferUsed: false,
    shieldUsed: false,
  };
};

/**
 * Calculates next team index in rotation
 */
export const getNextTeamIndex = (currentIndex: number, totalTeams: number): number => {
  return (currentIndex + 1) % totalTeams;
};

/**
 * Formats time in MM:SS format
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Generates a unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Calculates absolute difference between two numbers
 */
export const calculateDifference = (value1: number, value2: number): number => {
  return Math.abs(value1 - value2);
};

/**
 * Shuffles an array (Fisher-Yates algorithm)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Gets random item from array
 */
export const getRandomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Deep clones an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
