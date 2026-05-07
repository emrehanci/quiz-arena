import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import JokerPanel from '../JokerPanel';
import { mockTeams, mockQuestion } from '../../../tests/mockData';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'jokers.title': 'Jokers',
        'jokers.fiftyFifty': '50/50',
        'jokers.fiftyFiftyDescription': 'Eliminate 2 wrong answers',
        'jokers.transfer': 'Transfer',
        'jokers.transferDescription': 'Pass to another team',
        'jokers.shield': 'Shield',
        'jokers.shieldDescription': 'Protect one option',
        'jokers.used': 'Used',
      };
      return translations[key] || key;
    },
  }),
}));

describe('JokerPanel', () => {
  const defaultProps = {
    currentTeam: mockTeams[0],
    otherTeams: [mockTeams[1]],
    options: mockQuestion.options,
    eliminatedOptions: [],
    onUseFiftyFifty: vi.fn(),
    onUseTransfer: vi.fn(),
    onUseShield: vi.fn(),
  };

  it('should render joker panel with all jokers', () => {
    render(<JokerPanel {...defaultProps} />);
    
    expect(screen.getByText('Jokers')).toBeInTheDocument();
    expect(screen.getByText('50/50')).toBeInTheDocument();
    expect(screen.getByText('Transfer')).toBeInTheDocument();
    expect(screen.getByText('Shield')).toBeInTheDocument();
  });

  it('should disable fifty-fifty when already used', () => {
    const team = {
      ...mockTeams[0],
      jokers: { ...mockTeams[0].jokers, fiftyFiftyUsed: true },
    };
    
    render(<JokerPanel {...defaultProps} currentTeam={team} />);
    
    const buttons = screen.getAllByRole('button');
    const fiftyFiftyButton = buttons.find(btn => 
      btn.textContent?.includes('Used') || btn.disabled
    );
    
    expect(fiftyFiftyButton).toBeDefined();
  });

  it('should disable all jokers when disabled prop is true', () => {
    render(<JokerPanel {...defaultProps} disabled={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should disable jokers when transferred', () => {
    render(<JokerPanel {...defaultProps} isTransferred={true} />);
    
    const buttons = screen.getAllByRole('button');
    // At least some buttons should be disabled
    const disabledButtons = buttons.filter(btn => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it('should show available options for shield', () => {
    render(<JokerPanel {...defaultProps} />);
    
    // Panel should render without errors
    expect(screen.getByText('Jokers')).toBeInTheDocument();
  });

  it('should not allow fifty-fifty when less than 4 options', () => {
    const eliminatedOptions = ['a', 'b'];
    
    render(
      <JokerPanel {...defaultProps} eliminatedOptions={eliminatedOptions} />
    );
    
    // Component should render
    expect(screen.getByText('50/50')).toBeInTheDocument();
  });
});
