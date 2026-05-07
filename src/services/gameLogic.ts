import type {
  Team,
  Question,
  QuizSet,
  AnsweredQuestion,
  FinalRoundAnswer,
} from '../types';
import {
  MAX_CONSECUTIVE_CORRECT,
  MAX_WRONG_ATTEMPTS,
  FINAL_ROUND_POINTS,
} from '../constants';
import { getRandomItem, calculateDifference } from '../utils/helpers';

/**
 * Game Logic Service
 * Contains all business logic for the quiz game
 */
export class GameLogicService {
  /**
   * Checks if a team can continue (hasn't reached max consecutive correct)
   */
  static canTeamContinue(team: Team): boolean {
    return team.consecutiveCorrectCount < MAX_CONSECUTIVE_CORRECT;
  }

  /**
   * Checks if a question can still be answered (hasn't reached max wrong attempts)
   */
  static canQuestionContinue(wrongAttempts: number): boolean {
    return wrongAttempts < MAX_WRONG_ATTEMPTS;
  }

  /**
   * Gets a random question for a specific category and point value
   */
  static getRandomQuestion(
    set: QuizSet,
    categoryId: string,
    point: number,
    answeredQuestions: AnsweredQuestion[],
    lostQuestions: AnsweredQuestion[]
  ): Question | null {
    const category = set.categories.find(c => c.id === categoryId);
    if (!category) return null;

    const questions = category.questionsByPoint[point as keyof typeof category.questionsByPoint];
    if (!questions || questions.length === 0) return null;

    // Filter out already answered or lost questions
    const allUsedQuestions = [...answeredQuestions, ...lostQuestions];
    const availableQuestions = questions.filter(q => {
      return !allUsedQuestions.some(
        used => used.categoryId === categoryId && used.point === point && used.questionId === q.id
      );
    });

    if (availableQuestions.length === 0) return null;

    return getRandomItem(availableQuestions);
  }

  /**
   * Checks if a category/point combination is available
   */
  static isCellAvailable(
    categoryId: string,
    point: number,
    answeredQuestions: AnsweredQuestion[],
    lostQuestions: AnsweredQuestion[]
  ): boolean {
    const allUsed = [...answeredQuestions, ...lostQuestions];
    return !allUsed.some(q => q.categoryId === categoryId && q.point === point);
  }

  /**
   * Applies fifty-fifty joker - eliminates 2 wrong options randomly
   */
  static applyFiftyFifty(question: Question, eliminatedOptions: string[]): string[] {
    const wrongOptions = question.options
      .filter(opt => opt.id !== question.correctOptionId)
      .filter(opt => !eliminatedOptions.includes(opt.id));

    if (wrongOptions.length < 2) return eliminatedOptions;

    // Randomly select 2 wrong options to eliminate
    const shuffled = [...wrongOptions].sort(() => Math.random() - 0.5);
    const toEliminate = shuffled.slice(0, 2);

    return [...eliminatedOptions, ...toEliminate.map(opt => opt.id)];
  }

  /**
   * Handles correct answer logic
   */
  static handleCorrectAnswer(team: Team, points: number): Team {
    return {
      ...team,
      score: team.score + points,
      consecutiveCorrectCount: team.consecutiveCorrectCount + 1,
    };
  }

  /**
   * Handles wrong answer logic for the answering team
   */
  static handleWrongAnswer(team: Team, points: number, isTransfer: boolean): Team {
    if (isTransfer) {
      return {
        ...team,
        score: team.score - points,
        consecutiveCorrectCount: 0,
      };
    }
    return {
      ...team,
      consecutiveCorrectCount: 0,
    };
  }

  /**
   * Resets consecutive correct count for a team
   */
  static resetConsecutiveCount(team: Team): Team {
    return {
      ...team,
      consecutiveCorrectCount: 0,
    };
  }

  /**
   * Calculates final round rankings based on proximity to correct answer
   */
  static calculateFinalRoundRankings(
    answers: FinalRoundAnswer[],
    correctAnswer: number
  ): Array<{ teamId: string; rank: number; difference: number }> {
    // Calculate differences
    const withDifferences = answers.map(answer => ({
      teamId: answer.teamId,
      difference: calculateDifference(answer.answer, correctAnswer),
    }));

    // Sort by difference (ascending)
    withDifferences.sort((a, b) => a.difference - b.difference);

    // Assign ranks considering ties
    const ranked: Array<{ teamId: string; rank: number; difference: number }> = [];
    let currentRank = 1;
    let previousDifference = -1;
    let teamsWithSameRank = 0;

    withDifferences.forEach((item, index) => {
      if (item.difference !== previousDifference) {
        currentRank = index + 1;
        teamsWithSameRank = 1;
      } else {
        teamsWithSameRank++;
      }

      ranked.push({
        teamId: item.teamId,
        rank: currentRank,
        difference: item.difference,
      });

      previousDifference = item.difference;
    });

    return ranked;
  }

  /**
   * Calculates points for a final round ranking
   */
  static getFinalRoundPoints(rank: number): number {
    if (rank in FINAL_ROUND_POINTS) {
      return FINAL_ROUND_POINTS[rank as keyof typeof FINAL_ROUND_POINTS];
    }
    return 0;
  }

  /**
   * Applies final round points to teams
   */
  static applyFinalRoundPoints(
    teams: Team[],
    rankings: Array<{ teamId: string; rank: number; difference: number }>
  ): Team[] {
    return teams.map(team => {
      const ranking = rankings.find(r => r.teamId === team.id);
      if (!ranking) return team;

      const points = this.getFinalRoundPoints(ranking.rank);
      return {
        ...team,
        score: team.score + points,
      };
    });
  }

  /**
   * Checks if all regular questions are answered or lost
   */
  static areAllQuestionsCompleted(
    set: QuizSet,
    answeredQuestions: AnsweredQuestion[],
    lostQuestions: AnsweredQuestion[]
  ): boolean {
    const totalQuestions = set.categories.reduce((total, category) => {
      return total + Object.values(category.questionsByPoint).reduce((sum, arr) => sum + (arr.length > 0 ? 1 : 0), 0);
    }, 0);

    const completedQuestions = new Set<string>();
    [...answeredQuestions, ...lostQuestions].forEach(q => {
      completedQuestions.add(`${q.categoryId}-${q.point}`);
    });

    return completedQuestions.size >= totalQuestions;
  }

  /**
   * Gets the winner team(s)
   */
  static getWinners(teams: Team[]): Team[] {
    if (teams.length === 0) return [];

    const maxScore = Math.max(...teams.map(t => t.score));
    return teams.filter(t => t.score === maxScore);
  }

  /**
   * Checks if shield joker protects the team
   */
  static doesShieldProtect(shieldedOptionId: string | undefined, correctOptionId: string): boolean {
    return shieldedOptionId === correctOptionId;
  }

  /**
   * Handles transfer joker correct answer
   */
  static handleTransferCorrect(
    teams: Team[],
    transferredFromTeamId: string,
    transferredToTeamId: string,
    points: number
  ): Team[] {
    return teams.map(team => {
      if (team.id === transferredToTeamId) {
        return {
          ...team,
          score: team.score + points,
          consecutiveCorrectCount: team.consecutiveCorrectCount + 1,
        };
      }
      if (team.id === transferredFromTeamId) {
        return {
          ...team,
          score: team.score - points,
          consecutiveCorrectCount: 0,
        };
      }
      return team;
    });
  }

  /**
   * Handles transfer joker wrong answer
   */
  static handleTransferWrong(
    teams: Team[],
    transferredFromTeamId: string,
    transferredToTeamId: string,
    points: number
  ): Team[] {
    return teams.map(team => {
      if (team.id === transferredFromTeamId) {
        return {
          ...team,
          score: team.score + points,
        };
      }
      if (team.id === transferredToTeamId) {
        return {
          ...team,
          score: team.score - points,
          consecutiveCorrectCount: 0,
        };
      }
      return team;
    });
  }
}
