import { describe, it, expect, beforeEach } from 'vitest';
import gameReducer, {
  setPhase,
  setActiveSet,
  addTeam,
  removeTeam,
  updateTeamName,
  updateTeamScore,
  setActiveQuestion,
  clearActiveQuestion,
  updateTeam,
  updateMultipleTeams,
  setCurrentTeamIndex,
  changeTeamFromAdmin,
  nextTeam,
  resetTeamConsecutiveCount,
  addAnsweredQuestion,
  addLostQuestion,
  removeAnsweredQuestion,
  removeLostQuestion,
  incrementWrongAttempts,
  addEliminatedOption,
  setEliminatedOptions,
  setShieldedOption,
  setTransferInfo,
  useJoker,
  resetTeamTurnJokers,
  pauseTimer,
  resumeTimer,
  resetTimer,
  updateTimeRemaining,
  startFinalRound,
  nextFinalRoundQuestion,
  addFinalRoundAnswers,
  endFinalRound,
  resetGame,
  startNewGame,
} from '../gameSlice';
import type { GameState } from '../../types';
import { mockTeams, mockQuestion } from '../../tests/mockData';
import { GamePhase } from '../../types';

describe('gameSlice', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = {
      activeSetId: null,
      teams: mockTeams,
      currentTeamIndex: 0,
      activeQuestion: null,
      answeredQuestions: [],
      lostQuestions: [],
      phase: GamePhase.NOT_STARTED,
      isFinalRoundEnabled: false,
      finalRound: {
        currentQuestionIndex: 0,
        answers: {},
        isActive: false,
      },
    };
  });

  describe('setActiveQuestion', () => {
    it('should set active question with initial state', () => {
      const state = gameReducer(initialState, setActiveQuestion(mockQuestion));
      
      expect(state.activeQuestion).toBeDefined();
      expect(state.activeQuestion?.question).toEqual(mockQuestion);
      expect(state.activeQuestion?.timeRemaining).toBe(45000);
      expect(state.activeQuestion?.wrongAttempts).toBe(0);
      expect(state.activeQuestion?.eliminatedOptions).toEqual([]);
    });
  });

  describe('clearActiveQuestion', () => {
    it('should clear active question', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 1,
          eliminatedOptions: ['a'],
        },
      };
      
      const state = gameReducer(stateWithQuestion, clearActiveQuestion());
      
      expect(state.activeQuestion).toBeNull();
    });
  });

  describe('updateTeam', () => {
    it('should update team data', () => {
      const updatedTeam = {
        ...mockTeams[0],
        score: 1000,
        consecutiveCorrectCount: 2,
      };
      
      const state = gameReducer(initialState, updateTeam(updatedTeam));
      
      const team = state.teams.find(t => t.id === updatedTeam.id);
      expect(team?.score).toBe(1000);
      expect(team?.consecutiveCorrectCount).toBe(2);
    });
  });

  describe('nextTeam', () => {
    it('should move to next team', () => {
      const state = gameReducer(initialState, nextTeam());
      
      expect(state.currentTeamIndex).toBe(1);
    });

    it('should wrap around to first team', () => {
      const stateAtEnd = {
        ...initialState,
        currentTeamIndex: mockTeams.length - 1,
      };
      
      const state = gameReducer(stateAtEnd, nextTeam());
      
      expect(state.currentTeamIndex).toBe(0);
    });
  });

  describe('addAnsweredQuestion', () => {
    it('should add question to answered list', () => {
      const question = {
        categoryId: 'cat-1',
        point: 100,
        questionId: 'q-1',
      };
      
      const state = gameReducer(initialState, addAnsweredQuestion(question));
      
      expect(state.answeredQuestions).toHaveLength(1);
      expect(state.answeredQuestions[0]).toEqual(question);
    });
  });

  describe('addLostQuestion', () => {
    it('should add question to lost list', () => {
      const question = {
        categoryId: 'cat-1',
        point: 100,
        questionId: 'q-1',
      };
      
      const state = gameReducer(initialState, addLostQuestion(question));
      
      expect(state.lostQuestions).toHaveLength(1);
      expect(state.lostQuestions[0]).toEqual(question);
    });
  });

  describe('incrementWrongAttempts', () => {
    it('should increment wrong attempts', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, incrementWrongAttempts());
      
      expect(state.activeQuestion?.wrongAttempts).toBe(1);
    });
  });

  describe('addEliminatedOption', () => {
    it('should add option to eliminated list', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, addEliminatedOption('a'));
      
      expect(state.activeQuestion?.eliminatedOptions).toContain('a');
    });
  });

  describe('setShieldedOption', () => {
    it('should set shielded option', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, setShieldedOption('c'));
      
      expect(state.activeQuestion?.shieldedOptionId).toBe('c');
    });
  });

  describe('useJoker', () => {
    it('should mark joker as used and increment jokersUsedThisTurn', () => {
      const state = gameReducer(
        initialState,
        useJoker({ teamId: 'team-1', jokerType: 'fiftyFiftyUsed' })
      );
      
      const team = state.teams.find(t => t.id === 'team-1');
      expect(team?.jokers.fiftyFiftyUsed).toBe(true);
      expect(team?.jokersUsedThisTurn).toBe(1);
    });
  });

  describe('resetTeamTurnJokers', () => {
    it('should reset jokersUsedThisTurn counter', () => {
      // First use a joker
      let state = gameReducer(
        initialState,
        useJoker({ teamId: 'team-1', jokerType: 'fiftyFiftyUsed' })
      );
      
      let team = state.teams.find(t => t.id === 'team-1');
      expect(team?.jokersUsedThisTurn).toBe(1);
      
      // Then reset the turn jokers
      state = gameReducer(state, resetTeamTurnJokers('team-1'));
      
      team = state.teams.find(t => t.id === 'team-1');
      expect(team?.jokersUsedThisTurn).toBe(0);
      expect(team?.jokers.fiftyFiftyUsed).toBe(true); // Permanent joker state unchanged
    });
  });

  describe('Timer actions', () => {
    it('should pause timer', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, pauseTimer());
      
      expect(state.activeQuestion?.timerPaused).toBe(true);
    });

    it('should resume timer', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: true,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, resumeTimer());
      
      expect(state.activeQuestion?.timerPaused).toBe(false);
    });

    it('should reset timer', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 10000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, resetTimer());
      
      expect(state.activeQuestion?.timeRemaining).toBe(45000);
    });

    it('should update time remaining', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, updateTimeRemaining(25000));
      
      expect(state.activeQuestion?.timeRemaining).toBe(25000);
    });
  });

  describe('Phase management', () => {
    it('should set game phase', () => {
      const state = gameReducer(initialState, setPhase(GamePhase.BOARD));
      expect(state.phase).toBe(GamePhase.BOARD);
    });
  });

  describe('Set management', () => {
    it('should set active set with final round enabled', () => {
      const state = gameReducer(
        initialState,
        setActiveSet({ setId: 'set-1', finalRoundEnabled: true })
      );
      
      expect(state.activeSetId).toBe('set-1');
      expect(state.isFinalRoundEnabled).toBe(true);
      expect(state.phase).toBe(GamePhase.TEAM_SETUP);
    });

    it('should set active set with final round disabled', () => {
      const state = gameReducer(
        initialState,
        setActiveSet({ setId: 'set-2', finalRoundEnabled: false })
      );
      
      expect(state.activeSetId).toBe('set-2');
      expect(state.isFinalRoundEnabled).toBe(false);
    });
  });

  describe('Team management extended', () => {
    it('should add team', () => {
      const emptyState = {
        ...initialState,
        teams: [],
      };
      const newTeam = mockTeams[0];
      const state = gameReducer(emptyState, addTeam(newTeam));
      
      expect(state.teams).toHaveLength(1);
      expect(state.teams[0]).toEqual(newTeam);
    });

    it('should remove team by id', () => {
      const stateWithTeams = { ...initialState, teams: mockTeams };
      const state = gameReducer(stateWithTeams, removeTeam('team-1'));
      
      expect(state.teams).toHaveLength(1);
      expect(state.teams.find(t => t.id === 'team-1')).toBeUndefined();
    });

    it('should update team name', () => {
      const stateWithTeams = { ...initialState, teams: mockTeams };
      const state = gameReducer(
        stateWithTeams,
        updateTeamName({ teamId: 'team-1', name: 'New Name' })
      );
      
      const team = state.teams.find(t => t.id === 'team-1');
      expect(team?.name).toBe('New Name');
    });

    it('should update team score', () => {
      const stateWithTeams = { ...initialState, teams: mockTeams };
      const state = gameReducer(
        stateWithTeams,
        updateTeamScore({ teamId: 'team-1', score: 999 })
      );
      
      const team = state.teams.find(t => t.id === 'team-1');
      expect(team?.score).toBe(999);
    });

    it('should update multiple teams', () => {
      const stateWithTeams = { ...initialState, teams: mockTeams };
      const updatedTeams = mockTeams.map(t => ({ ...t, score: 1000 }));
      
      const state = gameReducer(stateWithTeams, updateMultipleTeams(updatedTeams));
      
      state.teams.forEach(team => {
        expect(team.score).toBe(1000);
      });
    });

    it('should reset team consecutive count', () => {
      const stateWithTeams = { ...initialState, teams: mockTeams };
      const state = gameReducer(stateWithTeams, resetTeamConsecutiveCount('team-1'));
      
      const team = state.teams.find(t => t.id === 'team-1');
      expect(team?.consecutiveCorrectCount).toBe(0);
    });
  });

  describe('Turn management extended', () => {
    it('should set current team index', () => {
      const stateWithTeams = { ...initialState, teams: mockTeams };
      const state = gameReducer(stateWithTeams, setCurrentTeamIndex(1));
      
      expect(state.currentTeamIndex).toBe(1);
    });

    it('should reset all team consecutive counts when changed from admin', () => {
      const teams = mockTeams.map(team => ({ ...team, consecutiveCorrectCount: 2 }));
      const state = gameReducer(
        { ...initialState, teams },
        changeTeamFromAdmin(1)
      );

      expect(state.currentTeamIndex).toBe(1);
      state.teams.forEach(team => {
        expect(team.consecutiveCorrectCount).toBe(0);
      });
    });
  });

  describe('Question management extended', () => {
    it('should set eliminated options', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(stateWithQuestion, setEliminatedOptions(['a', 'b']));
      
      expect(state.activeQuestion?.eliminatedOptions).toEqual(['a', 'b']);
    });

    it('should set transfer info', () => {
      const stateWithQuestion = {
        ...initialState,
        activeQuestion: {
          question: mockQuestion,
          startTime: Date.now(),
          timeRemaining: 30000,
          timerPaused: false,
          wrongAttempts: 0,
          eliminatedOptions: [],
        },
      };
      
      const state = gameReducer(
        stateWithQuestion,
        setTransferInfo({ fromTeamId: 'team-1', toTeamId: 'team-2' })
      );
      
      expect(state.activeQuestion?.isTransferred).toBe(true);
      expect(state.activeQuestion?.transferredFromTeamId).toBe('team-1');
      expect(state.activeQuestion?.transferredToTeamId).toBe('team-2');
    });

    it('should remove answered question', () => {
      const stateWithAnswered = {
        ...initialState,
        answeredQuestions: [
          { categoryId: 'cat-1', point: 100, questionId: 'q-1' },
          { categoryId: 'cat-2', point: 200, questionId: 'q-2' },
        ],
      };
      
      const state = gameReducer(
        stateWithAnswered,
        removeAnsweredQuestion({ categoryId: 'cat-1', point: 100 })
      );
      
      expect(state.answeredQuestions).toHaveLength(1);
      expect(state.answeredQuestions[0].categoryId).toBe('cat-2');
    });

    it('should remove lost question', () => {
      const stateWithLost = {
        ...initialState,
        lostQuestions: [
          { categoryId: 'cat-1', point: 100, questionId: 'q-1' },
          { categoryId: 'cat-2', point: 200, questionId: 'q-2' },
        ],
      };
      
      const state = gameReducer(
        stateWithLost,
        removeLostQuestion({ categoryId: 'cat-1', point: 100 })
      );
      
      expect(state.lostQuestions).toHaveLength(1);
      expect(state.lostQuestions[0].categoryId).toBe('cat-2');
    });
  });

  describe('Final Round', () => {
    it('should start final round', () => {
      const state = gameReducer(initialState, startFinalRound());
      
      expect(state.phase).toBe(GamePhase.FINAL_ROUND);
      expect(state.finalRound.isActive).toBe(true);
      expect(state.finalRound.currentQuestionIndex).toBe(0);
      expect(state.finalRound.answers).toEqual({});
    });

    it('should move to next final round question', () => {
      const stateWithFinalRound = {
        ...initialState,
        finalRound: {
          currentQuestionIndex: 0,
          answers: {},
          isActive: true,
        },
      };
      
      const state = gameReducer(stateWithFinalRound, nextFinalRoundQuestion());
      
      expect(state.finalRound.currentQuestionIndex).toBe(1);
    });

    it('should add final round answers', () => {
      const stateWithFinalRound = {
        ...initialState,
        finalRound: {
          currentQuestionIndex: 0,
          answers: {},
          isActive: true,
        },
      };
      
      const answers = [
        { teamId: 'team-1', answer: 42 },
        { teamId: 'team-2', answer: 50 },
      ];
      
      const state = gameReducer(
        stateWithFinalRound,
        addFinalRoundAnswers({ questionId: 'final-1', answers })
      );
      
      expect(state.finalRound.answers['final-1']).toEqual(answers);
    });

    it('should end final round', () => {
      const stateWithFinalRound = {
        ...initialState,
        finalRound: {
          currentQuestionIndex: 4,
          answers: {},
          isActive: true,
        },
      };
      
      const state = gameReducer(stateWithFinalRound, endFinalRound());
      
      expect(state.finalRound.isActive).toBe(false);
      expect(state.phase).toBe(GamePhase.RESULTS);
    });
  });

  describe('Game reset', () => {
    it('should reset game to initial state', () => {
      const stateWithData = {
        ...initialState,
        teams: mockTeams,
        phase: GamePhase.BOARD,
        activeSetId: 'set-1',
      };
      
      const state = gameReducer(stateWithData, resetGame());
      
      expect(state.phase).toBe(GamePhase.NOT_STARTED);
      expect(state.teams).toEqual([]);
      expect(state.activeSetId).toBeNull();
    });

    it('should start new game', () => {
      const stateWithData = {
        ...initialState,
        teams: mockTeams,
        phase: GamePhase.RESULTS,
        activeSetId: 'set-1',
        answeredQuestions: [{ categoryId: 'cat-1', point: 100, questionId: 'q-1' }],
      };
      
      const state = gameReducer(stateWithData, startNewGame());
      
      expect(state.phase).toBe(GamePhase.NOT_STARTED);
      expect(state.teams).toEqual([]);
      expect(state.activeSetId).toBeNull();
      expect(state.answeredQuestions).toEqual([]);
      expect(state.isFinalRoundEnabled).toBe(false);
    });
  });
});
