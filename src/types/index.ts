// Option model for question choices
export interface Option {
  id: string;
  text: string;
}

// Regular question model
export interface Question {
  id: string;
  categoryId: string;
  point: number;
  questionText: string;
  options: Option[];
  correctOptionId: string;
  explanation: string;
}

// Final round question model
export interface FinalRoundQuestion {
  id: string;
  questionText: string;
  correctAnswer: number;
  explanation: string;
}

// Category model with questions grouped by points
export interface Category {
  id: string;
  title: string;
  questionsByPoint: {
    100: Question[];
    200: Question[];
    300: Question[];
    400: Question[];
    500: Question[];
  };
}

// Quiz set model
export interface QuizSet {
  id: string;
  name: string;
  description: string;
  finalRoundEnabled: boolean;
  categories: Category[];
  finalRoundQuestions: FinalRoundQuestion[];
}

// Jokers for each team
export interface Jokers {
  fiftyFiftyUsed: boolean;
  transferUsed: boolean;
  shieldUsed: boolean;
}

// Team/Group model
export interface Team {
  id: string;
  name: string;
  score: number;
  consecutiveCorrectCount: number;
  jokers: Jokers;
  jokersUsedThisTurn: number; // Tracks how many jokers used in current turn (max 1)
}

// Active question state
export interface ActiveQuestion {
  question: Question;
  startTime: number;
  timeRemaining: number;
  timerPaused: boolean;
  wrongAttempts: number;
  eliminatedOptions: string[];
  selectedRandomQuestionId?: string;
  shieldedOptionId?: string;
  isTransferred?: boolean;
  transferredFromTeamId?: string;
  transferredToTeamId?: string;
}

// Final round answer from a team
export interface FinalRoundAnswer {
  teamId: string;
  answer: number;
}

// Final round state
export interface FinalRoundState {
  currentQuestionIndex: number;
  answers: Record<string, FinalRoundAnswer[]>; // questionId -> answers
  isActive: boolean;
}

// Game phase
export const GamePhase = {
  NOT_STARTED: 'NOT_STARTED',
  TEAM_SETUP: 'TEAM_SETUP',
  BOARD: 'BOARD',
  QUESTION: 'QUESTION',
  FINAL_ROUND: 'FINAL_ROUND',
  RESULTS: 'RESULTS',
} as const;

export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

// Answered/Lost questions tracking
export interface AnsweredQuestion {
  categoryId: string;
  point: number;
  questionId: string;
}

// Main game state
export interface GameState {
  phase: GamePhase;
  activeSetId: string | null;
  teams: Team[];
  currentTeamIndex: number;
  activeQuestion: ActiveQuestion | null;
  answeredQuestions: AnsweredQuestion[];
  lostQuestions: AnsweredQuestion[];
  finalRound: FinalRoundState;
  isFinalRoundEnabled: boolean;
}

// Settings state
export interface SettingsState {
  language: string;
  sets: QuizSet[];
}

// Root state
export interface RootState {
  game: GameState;
  settings: SettingsState;
}
