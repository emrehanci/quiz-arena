import type { QuizSet, Team, Question, Category } from '../types';

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Team Alpha',
    score: 500,
    consecutiveCorrectCount: 1,
    jokers: {
      fiftyFiftyUsed: false,
      transferUsed: false,
      shieldUsed: false,
    },
    jokersUsedThisTurn: 0,
  },
  {
    id: 'team-2',
    name: 'Team Beta',
    score: 300,
    consecutiveCorrectCount: 0,
    jokers: {
      fiftyFiftyUsed: true,
      transferUsed: false,
      shieldUsed: false,
    },
    jokersUsedThisTurn: 0,
  },
];

export const mockQuestion: Question = {
  id: 'q-1',
  categoryId: 'cat-1',
  point: 100,
  questionText: 'Test question?',
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ],
  correctOptionId: 'b',
  explanation: 'B is correct',
};

const createMockQuestion = (id: string, categoryId: string, point: number): Question => ({
  id,
  categoryId,
  point,
  questionText: `Test question for ${point} points?`,
  options: [
    { id: 'a', text: 'Option A' },
    { id: 'b', text: 'Option B' },
    { id: 'c', text: 'Option C' },
    { id: 'd', text: 'Option D' },
  ],
  correctOptionId: 'b',
  explanation: 'B is correct',
});

export const mockCategory: Category = {
  id: 'cat-1',
  title: 'Test Category',
  questionsByPoint: {
    100: [createMockQuestion('q-100-1', 'cat-1', 100)],
    200: [createMockQuestion('q-200-1', 'cat-1', 200)],
    300: [createMockQuestion('q-300-1', 'cat-1', 300)],
    400: [createMockQuestion('q-400-1', 'cat-1', 400)],
    500: [createMockQuestion('q-500-1', 'cat-1', 500)],
  },
};

export const mockQuizSet: QuizSet = {
  id: 'set-1',
  name: 'Test Quiz Set',
  description: 'A test quiz set',
  finalRoundEnabled: true,
  categories: Array(10).fill(null).map((_, i) => ({
    id: `cat-${i + 1}`,
    title: `Category ${i + 1}`,
    questionsByPoint: {
      100: [createMockQuestion(`q-${i}-100-1`, `cat-${i + 1}`, 100)],
      200: [createMockQuestion(`q-${i}-200-1`, `cat-${i + 1}`, 200)],
      300: [createMockQuestion(`q-${i}-300-1`, `cat-${i + 1}`, 300)],
      400: [createMockQuestion(`q-${i}-400-1`, `cat-${i + 1}`, 400)],
      500: [createMockQuestion(`q-${i}-500-1`, `cat-${i + 1}`, 500)],
    },
  })),
  finalRoundQuestions: [
    {
      id: 'final-1',
      questionText: 'Final question?',
      correctAnswer: 42,
      explanation: '42 is the answer',
    },
  ],
};
