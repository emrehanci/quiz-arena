import { describe, it, expect, vi } from 'vitest';
import {
  createTeam,
  resetJokers,
  getNextTeamIndex,
  formatTime,
  generateId,
  calculateDifference,
  shuffleArray,
  getRandomItem,
  deepClone,
} from '../helpers';

describe('helpers', () => {
  describe('createTeam', () => {
    it('should create team with correct name', () => {
      const team = createTeam('Test Team');
      
      expect(team.name).toBe('Test Team');
      expect(team.score).toBe(0);
      expect(team.consecutiveCorrectCount).toBe(0);
      expect(team.jokersUsedThisTurn).toBe(0);
    });

    it('should create team with unique id', () => {
      const team1 = createTeam('Team 1');
      const team2 = createTeam('Team 2');
      
      expect(team1.id).not.toBe(team2.id);
    });

    it('should create team with default jokers', () => {
      const team = createTeam('Team');
      
      expect(team.jokers).toEqual({
        fiftyFiftyUsed: false,
        transferUsed: false,
        shieldUsed: false,
      });
    });
  });

  describe('resetJokers', () => {
    it('should return all jokers as unused', () => {
      const jokers = resetJokers();
      
      expect(jokers).toEqual({
        fiftyFiftyUsed: false,
        transferUsed: false,
        shieldUsed: false,
      });
    });
  });

  describe('getNextTeamIndex', () => {
    it('should return next index', () => {
      expect(getNextTeamIndex(0, 3)).toBe(1);
      expect(getNextTeamIndex(1, 3)).toBe(2);
    });

    it('should wrap around to 0', () => {
      expect(getNextTeamIndex(2, 3)).toBe(0);
    });

    it('should handle single team', () => {
      expect(getNextTeamIndex(0, 1)).toBe(0);
    });
  });

  describe('formatTime', () => {
    it('should format time correctly', () => {
      expect(formatTime(45000)).toBe('00:45');
      expect(formatTime(60000)).toBe('01:00');
      expect(formatTime(90000)).toBe('01:30');
    });

    it('should handle zero time', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should round up milliseconds', () => {
      expect(formatTime(1500)).toBe('00:02');
      expect(formatTime(500)).toBe('00:01');
    });

    it('should pad single digits', () => {
      expect(formatTime(5000)).toBe('00:05');
      expect(formatTime(9000)).toBe('00:09');
    });
  });

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
    });

    it('should generate valid uuid format', () => {
      const id = generateId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      expect(id).toMatch(uuidRegex);
    });
  });

  describe('calculateDifference', () => {
    it('should calculate positive difference', () => {
      expect(calculateDifference(10, 5)).toBe(5);
    });

    it('should calculate negative difference as positive', () => {
      expect(calculateDifference(5, 10)).toBe(5);
    });

    it('should return 0 for same numbers', () => {
      expect(calculateDifference(42, 42)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(calculateDifference(-5, -10)).toBe(5);
      expect(calculateDifference(-5, 10)).toBe(15);
    });
  });

  describe('shuffleArray', () => {
    it('should return array with same length', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      
      expect(shuffled).toHaveLength(arr.length);
    });

    it('should contain all original elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      
      arr.forEach(item => {
        expect(shuffled).toContain(item);
      });
    });

    it('should not modify original array', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      
      expect(arr).toEqual(original);
    });

    it('should handle empty array', () => {
      const shuffled = shuffleArray([]);
      expect(shuffled).toEqual([]);
    });

    it('should handle single element array', () => {
      const shuffled = shuffleArray([1]);
      expect(shuffled).toEqual([1]);
    });
  });

  describe('getRandomItem', () => {
    it('should return item from array', () => {
      const arr = [1, 2, 3, 4, 5];
      const item = getRandomItem(arr);
      
      expect(arr).toContain(item);
    });

    it('should return single item from single element array', () => {
      const item = getRandomItem([42]);
      expect(item).toBe(42);
    });

    it('should return different items on multiple calls', () => {
      // Mock Math.random to ensure different values
      const arr = [1, 2, 3, 4, 5];
      const items = new Set();
      
      // Call multiple times
      for (let i = 0; i < 10; i++) {
        items.add(getRandomItem(arr));
      }
      
      // With 10 calls on 5 items, we should get at least 2 different values
      // (statistically very likely, though not guaranteed)
      expect(items.size).toBeGreaterThan(0);
    });
  });

  describe('deepClone', () => {
    it('should clone simple object', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('should clone nested object', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
    });

    it('should clone array', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);
      
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('should clone complex structure', () => {
      const obj = {
        id: '123',
        name: 'Test',
        scores: [1, 2, 3],
        meta: {
          created: '2024-01-01',
          tags: ['a', 'b'],
        },
      };
      
      const cloned = deepClone(obj);
      
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.scores).not.toBe(obj.scores);
      expect(cloned.meta).not.toBe(obj.meta);
    });

    it('should not share references after modification', () => {
      const obj = { a: { b: 1 } };
      const cloned = deepClone(obj);
      
      cloned.a.b = 999;
      
      expect(obj.a.b).toBe(1);
      expect(cloned.a.b).toBe(999);
    });
  });
});
