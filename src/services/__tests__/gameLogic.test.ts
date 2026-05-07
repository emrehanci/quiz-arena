import { describe, it, expect } from 'vitest';
import { GameLogicService } from '../gameLogic';
import { mockTeams, mockQuestion, mockQuizSet } from '../../tests/mockData';

describe('GameLogicService', () => {
  describe('canTeamContinue', () => {
    it('should return true when team has less than 3 consecutive correct', () => {
      const team = { ...mockTeams[0], consecutiveCorrectCount: 2 };
      expect(GameLogicService.canTeamContinue(team)).toBe(true);
    });

    it('should return false when team has 3 consecutive correct', () => {
      const team = { ...mockTeams[0], consecutiveCorrectCount: 3 };
      expect(GameLogicService.canTeamContinue(team)).toBe(false);
    });

    it('should return true when team has 0 consecutive correct', () => {
      const team = { ...mockTeams[0], consecutiveCorrectCount: 0 };
      expect(GameLogicService.canTeamContinue(team)).toBe(true);
    });
  });

  describe('handleCorrectAnswer', () => {
    it('should add points to team score', () => {
      const team = mockTeams[0];
      const result = GameLogicService.handleCorrectAnswer(team, 200);
      
      expect(result.score).toBe(700); // 500 + 200
      expect(result.consecutiveCorrectCount).toBe(2); // 1 + 1
    });

    it('should increment consecutive correct count', () => {
      const team = { ...mockTeams[0], consecutiveCorrectCount: 0 };
      const result = GameLogicService.handleCorrectAnswer(team, 100);
      
      expect(result.consecutiveCorrectCount).toBe(1);
    });
  });

  describe('resetConsecutiveCount', () => {
    it('should reset consecutive count to 0', () => {
      const team = { ...mockTeams[0], consecutiveCorrectCount: 2 };
      const result = GameLogicService.resetConsecutiveCount(team);
      
      expect(result.consecutiveCorrectCount).toBe(0);
    });
  });

  describe('applyFiftyFifty', () => {
    it('should eliminate 2 wrong options', () => {
      const eliminatedOptions: string[] = [];
      const result = GameLogicService.applyFiftyFifty(mockQuestion, eliminatedOptions);
      
      expect(result.length).toBe(2);
      expect(result).not.toContain(mockQuestion.correctOptionId);
    });

    it('should not eliminate already eliminated options', () => {
      const eliminatedOptions = ['a'];
      const result = GameLogicService.applyFiftyFifty(mockQuestion, eliminatedOptions);
      
      expect(result.length).toBe(3); // 1 already + 2 new
      expect(result).toContain('a');
    });

    it('should return existing if less than 2 wrong options available', () => {
      const question = {
        ...mockQuestion,
        options: [
          { id: 'a', text: 'A' },
          { id: 'b', text: 'B' },
        ],
      };
      const eliminatedOptions: string[] = [];
      
      const result = GameLogicService.applyFiftyFifty(question, eliminatedOptions);
      expect(result.length).toBeLessThanOrEqual(2);
    });

    it('should handle case with all options already eliminated except correct', () => {
      const eliminatedOptions = ['a', 'c', 'd'];
      const result = GameLogicService.applyFiftyFifty(mockQuestion, eliminatedOptions);
      
      // Should just return existing eliminated options since only correct remains
      expect(result).toEqual(eliminatedOptions);
    });
  });

  describe('getRandomQuestion', () => {
    it('should return a question from the specified category and point', () => {
      const result = GameLogicService.getRandomQuestion(
        mockQuizSet,
        'cat-1',
        100,
        [],
        []
      );
      
      expect(result).toBeDefined();
      expect(result?.categoryId).toBe('cat-1');
      expect(result?.point).toBe(100);
    });

    it('should return null if question already answered', () => {
      // Get the actual question ID from the mock set
      const actualQuestionId = mockQuizSet.categories[0].questionsByPoint[100][0].id;
      
      const answeredQuestions = [{
        categoryId: 'cat-1',
        point: 100,
        questionId: actualQuestionId,
      }];
      
      const result = GameLogicService.getRandomQuestion(
        mockQuizSet,
        'cat-1',
        100,
        answeredQuestions,
        []
      );
      
      expect(result).toBeNull();
    });

    it('should return null if question is lost', () => {
      // Get the actual question ID from the mock set
      const actualQuestionId = mockQuizSet.categories[0].questionsByPoint[100][0].id;
      
      const lostQuestions = [{
        categoryId: 'cat-1',
        point: 100,
        questionId: actualQuestionId,
      }];
      
      const result = GameLogicService.getRandomQuestion(
        mockQuizSet,
        'cat-1',
        100,
        [],
        lostQuestions
      );
      
      expect(result).toBeNull();
    });

    it('should return null if category does not exist', () => {
      const result = GameLogicService.getRandomQuestion(
        mockQuizSet,
        'non-existent',
        100,
        [],
        []
      );
      
      expect(result).toBeNull();
    });
  });

  describe('handleTransferCorrect', () => {
    it('should transfer points correctly', () => {
      const fromTeamId = mockTeams[0].id;
      const toTeamId = mockTeams[1].id;
      
      const result = GameLogicService.handleTransferCorrect(
        mockTeams,
        fromTeamId,
        toTeamId,
        200
      );
      
      const fromTeam = result.find(t => t.id === fromTeamId);
      const toTeam = result.find(t => t.id === toTeamId);
      
      expect(fromTeam?.score).toBe(300); // 500 - 200
      expect(toTeam?.score).toBe(500); // 300 + 200
    });
  });

  describe('handleTransferWrong', () => {
    it('should penalize wrong answerer and reward transferrer', () => {
      const fromTeamId = mockTeams[0].id;
      const toTeamId = mockTeams[1].id;
      
      const result = GameLogicService.handleTransferWrong(
        mockTeams,
        fromTeamId,
        toTeamId,
        200
      );
      
      const fromTeam = result.find(t => t.id === fromTeamId);
      const toTeam = result.find(t => t.id === toTeamId);
      
      expect(fromTeam?.score).toBe(700); // 500 + 200
      expect(toTeam?.score).toBe(100); // 300 - 200
    });
  });

  describe('areAllQuestionsCompleted', () => {
    it('should return true when all questions are answered or lost', () => {
      const answeredQuestions = mockQuizSet.categories.flatMap(cat =>
        Object.entries(cat.questionsByPoint).flatMap(([point, questions]) =>
          questions.map(q => ({
            categoryId: cat.id,
            point: Number(point),
            questionId: q.id,
          }))
        )
      );
      
      const result = GameLogicService.areAllQuestionsCompleted(
        mockQuizSet,
        answeredQuestions,
        []
      );
      
      expect(result).toBe(true);
    });

    it('should return false when some questions remain', () => {
      const result = GameLogicService.areAllQuestionsCompleted(
        mockQuizSet,
        [],
        []
      );
      
      expect(result).toBe(false);
    });

    it('should count both answered and lost questions', () => {
      const halfAnswered = mockQuizSet.categories.slice(0, 5).flatMap(cat =>
        Object.entries(cat.questionsByPoint).flatMap(([point, questions]) =>
          questions.map(q => ({
            categoryId: cat.id,
            point: Number(point),
            questionId: q.id,
          }))
        )
      );

      const halfLost = mockQuizSet.categories.slice(5).flatMap(cat =>
        Object.entries(cat.questionsByPoint).flatMap(([point, questions]) =>
          questions.map(q => ({
            categoryId: cat.id,
            point: Number(point),
            questionId: q.id,
          }))
        )
      );

      const result = GameLogicService.areAllQuestionsCompleted(
        mockQuizSet,
        halfAnswered,
        halfLost
      );

      expect(result).toBe(true);
    });
  });

  describe('calculateFinalRoundRankings', () => {
    it('should rank teams by proximity to correct answer', () => {
      const answers = [
        { teamId: 'team-1', answer: 100 },
        { teamId: 'team-2', answer: 50 },
        { teamId: 'team-3', answer: 42 },
      ];
      
      const result = GameLogicService.calculateFinalRoundRankings(answers, 42);
      
      expect(result[0].teamId).toBe('team-3');
      expect(result[0].rank).toBe(1);
      expect(result[0].difference).toBe(0);
      
      expect(result[1].teamId).toBe('team-2');
      expect(result[2].teamId).toBe('team-1');
    });

    it('should handle ties correctly', () => {
      const answers = [
        { teamId: 'team-1', answer: 50 },
        { teamId: 'team-2', answer: 50 },
        { teamId: 'team-3', answer: 100 },
      ];
      
      const result = GameLogicService.calculateFinalRoundRankings(answers, 42);
      
      // Both team-1 and team-2 should have rank 1
      expect(result[0].rank).toBe(1);
      expect(result[1].rank).toBe(1);
      expect(result[2].rank).toBe(3); // Next rank should be 3, not 2
    });
  });

  describe('getFinalRoundPoints', () => {
    it('should return correct points for each rank', () => {
      expect(GameLogicService.getFinalRoundPoints(1)).toBe(1000);
      expect(GameLogicService.getFinalRoundPoints(2)).toBe(750);
      expect(GameLogicService.getFinalRoundPoints(3)).toBe(500);
      expect(GameLogicService.getFinalRoundPoints(4)).toBe(100);
      expect(GameLogicService.getFinalRoundPoints(5)).toBe(0);
    });
  });

  describe('getWinners', () => {
    it('should return team with highest score', () => {
      const winners = GameLogicService.getWinners(mockTeams);
      
      expect(winners).toHaveLength(1);
      expect(winners[0].id).toBe('team-1'); // 500 points
    });

    it('should return multiple winners in case of tie', () => {
      const teams = [
        { ...mockTeams[0], score: 500 },
        { ...mockTeams[1], score: 500 },
      ];
      
      const winners = GameLogicService.getWinners(teams);
      
      expect(winners).toHaveLength(2);
    });

    it('should return empty array for no teams', () => {
      const winners = GameLogicService.getWinners([]);
      
      expect(winners).toEqual([]);
    });
  });

  describe('doesShieldProtect', () => {
    it('should return true when shielded option is correct', () => {
      const result = GameLogicService.doesShieldProtect('b', 'b');
      
      expect(result).toBe(true);
    });

    it('should return false when shielded option is not correct', () => {
      const result = GameLogicService.doesShieldProtect('a', 'b');
      
      expect(result).toBe(false);
    });

    it('should return false when no shield used', () => {
      const result = GameLogicService.doesShieldProtect(undefined, 'b');
      
      expect(result).toBe(false);
    });
  });

  describe('applyFinalRoundPoints', () => {
    it('should add points to teams based on rankings', () => {
      const rankings = [
        { teamId: 'team-1', rank: 1, difference: 0 },
        { teamId: 'team-2', rank: 2, difference: 10 },
      ];
      
      const result = GameLogicService.applyFinalRoundPoints(mockTeams, rankings);
      
      const team1 = result.find(t => t.id === 'team-1');
      const team2 = result.find(t => t.id === 'team-2');
      
      expect(team1?.score).toBe(1500); // 500 + 1000
      expect(team2?.score).toBe(1050); // 300 + 750
    });
  });
});
