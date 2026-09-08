import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  GameState,
  Team,
  AnsweredQuestion,
  FinalRoundAnswer,
  Question,
  GameLogEntry,
} from '../types';
import { GamePhase } from '../types';
import { QUESTION_DURATION } from '../constants';

const initialState: GameState = {
  phase: GamePhase.NOT_STARTED,
  activeSetId: null,
  teams: [],
  currentTeamIndex: 0,
  activeQuestion: null,
  answeredQuestions: [],
  lostQuestions: [],
  finalRound: {
    currentQuestionIndex: 0,
    answers: {},
    isActive: false,
  },
  isFinalRoundEnabled: false,
  gameLog: [],
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Phase management
    setPhase: (state, action: PayloadAction<GamePhase>) => {
      state.phase = action.payload;
    },

    // Set management
    setActiveSet: (state, action: PayloadAction<{ setId: string; finalRoundEnabled: boolean }>) => {
      state.activeSetId = action.payload.setId;
      state.isFinalRoundEnabled = action.payload.finalRoundEnabled;
      state.phase = GamePhase.TEAM_SETUP;
    },

    // Team management
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push(action.payload);
    },

    removeTeam: (state, action: PayloadAction<string>) => {
      state.teams = state.teams.filter(team => team.id !== action.payload);
    },

    updateTeamName: (state, action: PayloadAction<{ teamId: string; name: string }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.name = action.payload.name;
      }
    },

    updateTeamScore: (state, action: PayloadAction<{ teamId: string; score: number }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.score = action.payload.score;
      }
    },

    updateTeam: (state, action: PayloadAction<Team>) => {
      const index = state.teams.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.teams[index] = action.payload;
      }
    },

    updateMultipleTeams: (state, action: PayloadAction<Team[]>) => {
      action.payload.forEach(updatedTeam => {
        const index = state.teams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          state.teams[index] = updatedTeam;
        }
      });
    },

    // Turn management
    setCurrentTeamIndex: (state, action: PayloadAction<number>) => {
      state.currentTeamIndex = action.payload;
    },

    changeTeamFromAdmin: (state, action: PayloadAction<number>) => {
      state.currentTeamIndex = action.payload;
      state.teams.forEach(team => {
        team.consecutiveCorrectCount = 0;
      });
    },

    nextTeam: (state) => {
      state.currentTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
    },

    resetTeamConsecutiveCount: (state, action: PayloadAction<string>) => {
      const team = state.teams.find(t => t.id === action.payload);
      if (team) {
        team.consecutiveCorrectCount = 0;
      }
    },

    // Question management
    setActiveQuestion: (state, action: PayloadAction<Question>) => {
      state.activeQuestion = {
        question: action.payload,
        startTime: Date.now(),
        timeRemaining: QUESTION_DURATION,
        timerPaused: false,
        wrongAttempts: 0,
        eliminatedOptions: [],
        selectedRandomQuestionId: action.payload.id,
      };
      state.phase = GamePhase.QUESTION;
    },

    clearActiveQuestion: (state) => {
      state.activeQuestion = null;
      state.phase = GamePhase.BOARD;
    },

    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      if (state.activeQuestion) {
        state.activeQuestion.timeRemaining = action.payload;
      }
    },

    pauseTimer: (state) => {
      if (state.activeQuestion) {
        state.activeQuestion.timerPaused = true;
      }
    },

    resumeTimer: (state) => {
      if (state.activeQuestion) {
        state.activeQuestion.timerPaused = false;
      }
    },

    resetTimer: (state) => {
      if (state.activeQuestion) {
        state.activeQuestion.timeRemaining = QUESTION_DURATION;
      }
    },

    incrementWrongAttempts: (state) => {
      if (state.activeQuestion) {
        state.activeQuestion.wrongAttempts++;
      }
    },

    addEliminatedOption: (state, action: PayloadAction<string>) => {
      if (state.activeQuestion) {
        state.activeQuestion.eliminatedOptions.push(action.payload);
      }
    },

    setEliminatedOptions: (state, action: PayloadAction<string[]>) => {
      if (state.activeQuestion) {
        state.activeQuestion.eliminatedOptions = action.payload;
      }
    },

    setShieldedOption: (state, action: PayloadAction<string>) => {
      if (state.activeQuestion) {
        state.activeQuestion.shieldedOptionId = action.payload;
      }
    },

    setTransferInfo: (
      state,
      action: PayloadAction<{ fromTeamId: string; toTeamId: string }>
    ) => {
      if (state.activeQuestion) {
        state.activeQuestion.isTransferred = true;
        state.activeQuestion.transferredFromTeamId = action.payload.fromTeamId;
        state.activeQuestion.transferredToTeamId = action.payload.toTeamId;
      }
    },

    // Joker management
    useJoker: (
      state,
      action: PayloadAction<{ teamId: string; jokerType: 'fiftyFiftyUsed' | 'transferUsed' | 'shieldUsed' }>
    ) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        team.jokers[action.payload.jokerType] = true;
        team.jokersUsedThisTurn++;
      }
    },

    resetTeamTurnJokers: (state, action: PayloadAction<string>) => {
      const team = state.teams.find(t => t.id === action.payload);
      if (team) {
        team.jokersUsedThisTurn = 0;
      }
    },

    // Answered/Lost questions
    addAnsweredQuestion: (state, action: PayloadAction<AnsweredQuestion>) => {
      state.answeredQuestions.push(action.payload);
    },

    addLostQuestion: (state, action: PayloadAction<AnsweredQuestion>) => {
      state.lostQuestions.push(action.payload);
    },

    removeAnsweredQuestion: (state, action: PayloadAction<{ categoryId: string; point: number }>) => {
      state.answeredQuestions = state.answeredQuestions.filter(
        q => !(q.categoryId === action.payload.categoryId && q.point === action.payload.point)
      );
    },

    removeLostQuestion: (state, action: PayloadAction<{ categoryId: string; point: number }>) => {
      state.lostQuestions = state.lostQuestions.filter(
        q => !(q.categoryId === action.payload.categoryId && q.point === action.payload.point)
      );
    },

    // Final Round
    startFinalRound: (state) => {
      state.phase = GamePhase.FINAL_ROUND;
      state.finalRound.isActive = true;
      state.finalRound.currentQuestionIndex = 0;
      state.finalRound.answers = {};
    },

    nextFinalRoundQuestion: (state) => {
      state.finalRound.currentQuestionIndex++;
    },

    addFinalRoundAnswers: (
      state,
      action: PayloadAction<{ questionId: string; answers: FinalRoundAnswer[] }>
    ) => {
      state.finalRound.answers[action.payload.questionId] = action.payload.answers;
    },

    endFinalRound: (state) => {
      state.finalRound.isActive = false;
      state.phase = GamePhase.RESULTS;
    },

    // Game reset
    resetGame: () => {
      return initialState;
    },

    startNewGame: (state) => {
      state.phase = GamePhase.NOT_STARTED;
      state.activeSetId = null;
      state.teams = [];
      state.currentTeamIndex = 0;
      state.activeQuestion = null;
      state.answeredQuestions = [];
      state.lostQuestions = [];
      state.finalRound = {
        currentQuestionIndex: 0,
        answers: {},
        isActive: false,
      };
      state.isFinalRoundEnabled = false;
      state.gameLog = [];
    },

    // Game logging
    addGameLogEntry: (state, action: PayloadAction<GameLogEntry>) => {
      state.gameLog.push(action.payload);
    },
  },
});

export const {
  setPhase,
  setActiveSet,
  addTeam,
  removeTeam,
  updateTeamName,
  updateTeamScore,
  updateTeam,
  updateMultipleTeams,
  setCurrentTeamIndex,
  changeTeamFromAdmin,
  nextTeam,
  resetTeamConsecutiveCount,
  setActiveQuestion,
  clearActiveQuestion,
  updateTimeRemaining,
  pauseTimer,
  resumeTimer,
  resetTimer,
  incrementWrongAttempts,
  addEliminatedOption,
  setEliminatedOptions,
  setShieldedOption,
  setTransferInfo,
  useJoker,
  resetTeamTurnJokers,
  addAnsweredQuestion,
  addLostQuestion,
  removeAnsweredQuestion,
  removeLostQuestion,
  startFinalRound,
  nextFinalRoundQuestion,
  addFinalRoundAnswers,
  endFinalRound,
  resetGame,
  startNewGame,
  addGameLogEntry,
} = gameSlice.actions;

export default gameSlice.reducer;
