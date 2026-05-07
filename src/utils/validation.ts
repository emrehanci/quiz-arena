import type { QuizSet, Category, Question, FinalRoundQuestion } from '../types';
import { TOTAL_CATEGORIES, POINT_VALUES, OPTION_COUNT } from '../constants';

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates a quiz set
 */
export const validateQuizSet = (set: QuizSet | any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Check if set exists
  if (!set) {
    errors.push({ field: 'set', message: 'Set is required' });
    return errors;
  }

  // Validate set name
  if (!set.name || set.name.trim() === '') {
    errors.push({ field: 'name', message: 'Set name is required' });
  }

  // Validate categories
  if (!set.categories || !Array.isArray(set.categories)) {
    errors.push({ field: 'categories', message: 'Categories must be an array' });
    return errors;
  }

  if (set.categories.length !== TOTAL_CATEGORIES) {
    errors.push({
      field: 'categories',
      message: `Exactly ${TOTAL_CATEGORIES} categories are required`,
    });
  }

  // Validate each category
  set.categories.forEach((category: Category, index: number) => {
    if (!category.title || category.title.trim() === '') {
      errors.push({
        field: `categories[${index}].title`,
        message: `Category ${index + 1} title is required`,
      });
    }

    if (!category.questionsByPoint) {
      errors.push({
        field: `categories[${index}].questionsByPoint`,
        message: `Category ${index + 1} must have questionsByPoint`,
      });
      return;
    }

    // Validate questions for each point value
    POINT_VALUES.forEach((point) => {
      const questions = category.questionsByPoint[point];
      
      if (!questions || !Array.isArray(questions)) {
        errors.push({
          field: `categories[${index}].questionsByPoint[${point}]`,
          message: `Category ${index + 1} must have an array for ${point} points`,
        });
        return;
      }

      if (questions.length === 0) {
        errors.push({
          field: `categories[${index}].questionsByPoint[${point}]`,
          message: `Category ${index + 1} must have at least one question for ${point} points`,
        });
      }

      // Validate each question
      questions.forEach((question: Question, qIndex: number) => {
        const qErrors = validateQuestion(question, `categories[${index}].questionsByPoint[${point}][${qIndex}]`);
        errors.push(...qErrors);
      });
    });
  });

  // Validate final round
  if (set.finalRoundEnabled) {
    if (!set.finalRoundQuestions || !Array.isArray(set.finalRoundQuestions)) {
      errors.push({
        field: 'finalRoundQuestions',
        message: 'Final round questions must be an array when final round is enabled',
      });
    } else if (set.finalRoundQuestions.length === 0) {
      errors.push({
        field: 'finalRoundQuestions',
        message: 'At least one final round question is required when final round is enabled',
      });
    } else {
      set.finalRoundQuestions.forEach((question: FinalRoundQuestion, index: number) => {
        const qErrors = validateFinalRoundQuestion(question, `finalRoundQuestions[${index}]`);
        errors.push(...qErrors);
      });
    }
  }

  return errors;
};

/**
 * Validates a regular question
 */
export const validateQuestion = (question: Question, fieldPrefix: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!question.questionText || question.questionText.trim() === '') {
    errors.push({ field: `${fieldPrefix}.questionText`, message: 'Question text is required' });
  }

  if (!question.options || !Array.isArray(question.options)) {
    errors.push({ field: `${fieldPrefix}.options`, message: 'Options must be an array' });
    return errors;
  }

  if (question.options.length !== OPTION_COUNT) {
    errors.push({
      field: `${fieldPrefix}.options`,
      message: `Exactly ${OPTION_COUNT} options are required`,
    });
  }

  question.options.forEach((option, index) => {
    if (!option.text || option.text.trim() === '') {
      errors.push({
        field: `${fieldPrefix}.options[${index}].text`,
        message: `Option ${index + 1} text is required`,
      });
    }
  });

  if (!question.correctOptionId) {
    errors.push({ field: `${fieldPrefix}.correctOptionId`, message: 'Correct option ID is required' });
  } else {
    const hasCorrectOption = question.options.some(opt => opt.id === question.correctOptionId);
    if (!hasCorrectOption) {
      errors.push({
        field: `${fieldPrefix}.correctOptionId`,
        message: 'Correct option ID must match one of the option IDs',
      });
    }
  }

  if (!question.explanation || question.explanation.trim() === '') {
    errors.push({ field: `${fieldPrefix}.explanation`, message: 'Explanation is required' });
  }

  return errors;
};

/**
 * Validates a final round question
 */
export const validateFinalRoundQuestion = (
  question: FinalRoundQuestion,
  fieldPrefix: string
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!question.questionText || question.questionText.trim() === '') {
    errors.push({ field: `${fieldPrefix}.questionText`, message: 'Question text is required' });
  }

  if (typeof question.correctAnswer !== 'number') {
    errors.push({ field: `${fieldPrefix}.correctAnswer`, message: 'Correct answer must be a number' });
  }

  if (!question.explanation || question.explanation.trim() === '') {
    errors.push({ field: `${fieldPrefix}.explanation`, message: 'Explanation is required' });
  }

  return errors;
};

/**
 * Checks if validation has errors
 */
export const hasValidationErrors = (errors: ValidationError[]): boolean => {
  return errors.length > 0;
};

/**
 * Formats validation errors for display
 */
export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(err => `${err.field}: ${err.message}`).join('\n');
};
