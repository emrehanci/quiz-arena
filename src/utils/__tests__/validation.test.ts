import { describe, it, expect } from 'vitest';
import {
  validateQuizSet,
  validateQuestion,
  validateFinalRoundQuestion,
  hasValidationErrors,
  formatValidationErrors,
} from '../validation';
import { mockQuizSet, mockQuestion } from '../../tests/mockData';

describe('validation', () => {
  describe('validateQuizSet', () => {
    it('should validate a correct quiz set', () => {
      const errors = validateQuizSet(mockQuizSet);
      
      expect(errors.length).toBe(0);
    });

    it('should return error for null set', () => {
      const errors = validateQuizSet(null);
      
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('set');
      expect(errors[0].message).toBe('Set is required');
    });

    it('should return error for missing name', () => {
      const set = { ...mockQuizSet, name: '' };
      const errors = validateQuizSet(set);
      
      const nameError = errors.find(e => e.field === 'name');
      expect(nameError).toBeDefined();
      expect(nameError?.message).toBe('Set name is required');
    });

    it('should return error for missing categories', () => {
      const set = { ...mockQuizSet, categories: undefined };
      const errors = validateQuizSet(set);
      
      const categoryError = errors.find(e => e.field === 'categories');
      expect(categoryError).toBeDefined();
    });

    it('should return error for wrong number of categories', () => {
      const set = {
        ...mockQuizSet,
        categories: [mockQuizSet.categories[0]],
      };
      const errors = validateQuizSet(set);
      
      const categoryError = errors.find(e => 
        e.field === 'categories' && e.message.includes('Exactly')
      );
      expect(categoryError).toBeDefined();
    });

    it('should return error for category without title', () => {
      const set = {
        ...mockQuizSet,
        categories: mockQuizSet.categories.map((cat, i) =>
          i === 0 ? { ...cat, title: '' } : cat
        ),
      };
      const errors = validateQuizSet(set);
      
      const titleError = errors.find(e => e.field.includes('title'));
      expect(titleError).toBeDefined();
    });

    it('should return error for missing questionsByPoint', () => {
      const set = {
        ...mockQuizSet,
        categories: mockQuizSet.categories.map((cat, i) =>
          i === 0 ? { ...cat, questionsByPoint: undefined } : cat
        ),
      };
      const errors = validateQuizSet(set as any);
      
      const qError = errors.find(e => e.field.includes('questionsByPoint'));
      expect(qError).toBeDefined();
    });

    it('should return error for non-array questionsByPoint', () => {
      const set = {
        ...mockQuizSet,
        categories: mockQuizSet.categories.map((cat, i) =>
          i === 0
            ? { ...cat, questionsByPoint: { 100: 'not-an-array' } }
            : cat
        ),
      };
      const errors = validateQuizSet(set as any);
      
      const qError = errors.find(e => e.message.includes('array'));
      expect(qError).toBeDefined();
    });

    it('should return error for missing questions', () => {
      const set = {
        ...mockQuizSet,
        categories: mockQuizSet.categories.map((cat, i) =>
          i === 0
            ? {
                ...cat,
                questionsByPoint: {
                  100: [],
                  200: [],
                  300: [],
                  400: [],
                  500: [],
                },
              }
            : cat
        ),
      };
      const errors = validateQuizSet(set);
      
      const questionError = errors.find(e => e.message.includes('at least one question'));
      expect(questionError).toBeDefined();
    });

    it('should validate final round when enabled', () => {
      const set = {
        ...mockQuizSet,
        finalRoundEnabled: true,
        finalRoundQuestions: [],
      };
      const errors = validateQuizSet(set);
      
      const finalRoundError = errors.find(e => 
        e.field === 'finalRoundQuestions'
      );
      expect(finalRoundError).toBeDefined();
    });
  });

  describe('validateQuestion', () => {
    it('should validate a correct question', () => {
      const errors = validateQuestion(mockQuestion, 'test');
      
      expect(errors.length).toBe(0);
    });

    it('should return error for missing question text', () => {
      const question = { ...mockQuestion, questionText: '' };
      const errors = validateQuestion(question, 'test');
      
      const textError = errors.find(e => e.field.includes('questionText'));
      expect(textError).toBeDefined();
    });

    it('should return error for missing options', () => {
      const question = { ...mockQuestion, options: undefined as any };
      const errors = validateQuestion(question, 'test');
      
      const optionError = errors.find(e => e.field.includes('options'));
      expect(optionError).toBeDefined();
    });

    it('should return error for wrong number of options', () => {
      const question = {
        ...mockQuestion,
        options: [mockQuestion.options[0]],
      };
      const errors = validateQuestion(question, 'test');
      
      const optionError = errors.find(e => 
        e.field.includes('options') && e.message.includes('Exactly')
      );
      expect(optionError).toBeDefined();
    });

    it('should return error for empty option text', () => {
      const question = {
        ...mockQuestion,
        options: mockQuestion.options.map((opt, i) =>
          i === 0 ? { ...opt, text: '' } : opt
        ),
      };
      const errors = validateQuestion(question, 'test');
      
      const optionError = errors.find(e => e.message.includes('text is required'));
      expect(optionError).toBeDefined();
    });

    it('should return error for missing correct option ID', () => {
      const question = { ...mockQuestion, correctOptionId: '' };
      const errors = validateQuestion(question, 'test');
      
      const correctError = errors.find(e => e.field.includes('correctOptionId'));
      expect(correctError).toBeDefined();
    });

    it('should return error for invalid correct option ID', () => {
      const question = { ...mockQuestion, correctOptionId: 'invalid' };
      const errors = validateQuestion(question, 'test');
      
      const correctError = errors.find(e => 
        e.message.includes('must match one of the option IDs')
      );
      expect(correctError).toBeDefined();
    });

    it('should return error for missing explanation', () => {
      const question = { ...mockQuestion, explanation: '' };
      const errors = validateQuestion(question, 'test');
      
      const explanationError = errors.find(e => e.field.includes('explanation'));
      expect(explanationError).toBeDefined();
    });
  });

  describe('validateFinalRoundQuestion', () => {
    const mockFinalQuestion = {
      id: 'final-1',
      questionText: 'Final question?',
      correctAnswer: 42,
      explanation: 'The answer is 42',
    };

    it('should validate a correct final round question', () => {
      const errors = validateFinalRoundQuestion(mockFinalQuestion, 'test');
      
      expect(errors.length).toBe(0);
    });

    it('should return error for missing question text', () => {
      const question = { ...mockFinalQuestion, questionText: '' };
      const errors = validateFinalRoundQuestion(question, 'test');
      
      const textError = errors.find(e => e.field.includes('questionText'));
      expect(textError).toBeDefined();
    });

    it('should return error for non-number correct answer', () => {
      const question = { ...mockFinalQuestion, correctAnswer: 'not a number' as any };
      const errors = validateFinalRoundQuestion(question, 'test');
      
      const answerError = errors.find(e => 
        e.field.includes('correctAnswer') && e.message.includes('must be a number')
      );
      expect(answerError).toBeDefined();
    });

    it('should return error for missing explanation', () => {
      const question = { ...mockFinalQuestion, explanation: '' };
      const errors = validateFinalRoundQuestion(question, 'test');
      
      const explanationError = errors.find(e => e.field.includes('explanation'));
      expect(explanationError).toBeDefined();
    });

    it('should accept zero as valid answer', () => {
      const question = { ...mockFinalQuestion, correctAnswer: 0 };
      const errors = validateFinalRoundQuestion(question, 'test');
      
      expect(errors.length).toBe(0);
    });

    it('should accept negative numbers as valid answer', () => {
      const question = { ...mockFinalQuestion, correctAnswer: -100 };
      const errors = validateFinalRoundQuestion(question, 'test');
      
      expect(errors.length).toBe(0);
    });
  });

  describe('hasValidationErrors', () => {
    it('should return true when errors exist', () => {
      const errors = [
        { field: 'test', message: 'Test error' },
      ];
      
      expect(hasValidationErrors(errors)).toBe(true);
    });

    it('should return false when no errors', () => {
      expect(hasValidationErrors([])).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format errors correctly', () => {
      const errors = [
        { field: 'field1', message: 'Error 1' },
        { field: 'field2', message: 'Error 2' },
      ];
      
      const formatted = formatValidationErrors(errors);
      
      expect(formatted).toContain('field1: Error 1');
      expect(formatted).toContain('field2: Error 2');
    });

    it('should return empty string for no errors', () => {
      const formatted = formatValidationErrors([]);
      
      expect(formatted).toBe('');
    });

    it('should join multiple errors with newline', () => {
      const errors = [
        { field: 'a', message: 'Error A' },
        { field: 'b', message: 'Error B' },
      ];
      
      const formatted = formatValidationErrors(errors);
      
      expect(formatted.split('\n')).toHaveLength(2);
    });
  });
});
