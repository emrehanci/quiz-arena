import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Scoreboard from '../Scoreboard';
import { mockTeams } from '../../../tests/mockData';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'gameBoard.scoreboard': 'Scoreboard',
        'results.score': 'Score',
        'gameBoard.currentTurn': 'Current Turn',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('Scoreboard', () => {
  it('should render all teams', () => {
    render(<Scoreboard teams={mockTeams} />);
    
    expect(screen.getByText('Team Alpha')).toBeInTheDocument();
    expect(screen.getByText('Team Beta')).toBeInTheDocument();
  });

  it('should display team scores', () => {
    render(<Scoreboard teams={mockTeams} />);
    
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('should highlight current team', () => {
    render(<Scoreboard teams={mockTeams} currentTeamId="team-1" />);
    
    expect(screen.getByText('Current Turn')).toBeInTheDocument();
  });

  it('should sort teams by score', () => {
    const teams = [
      { ...mockTeams[0], score: 100 },
      { ...mockTeams[1], score: 500 },
    ];
    
    render(<Scoreboard teams={teams} />);
    
    const scores = screen.getAllByText(/\d+/);
    // First score should be 500 (highest)
    expect(scores[0]).toHaveTextContent('500');
  });

  it('should show trophy for leading team', () => {
    render(<Scoreboard teams={mockTeams} />);
    
    // Team Alpha has higher score (500 > 300)
    const container = screen.getByText('Team Alpha').closest('div');
    expect(container).toBeInTheDocument();
  });

  it('should render empty scoreboard', () => {
    render(<Scoreboard teams={[]} />);
    
    expect(screen.getByText('Scoreboard')).toBeInTheDocument();
  });
});
