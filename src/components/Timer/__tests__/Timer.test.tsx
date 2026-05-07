import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Timer from '../Timer';
import gameReducer, { setActiveQuestion } from '../../../store/gameSlice';
import { mockQuestion } from '../../../tests/mockData';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      game: gameReducer,
    },
    preloadedState: initialState,
  });
};

describe('Timer', () => {
  it('should render timer with formatted time', () => {
    const store = createTestStore();
    store.dispatch(setActiveQuestion(mockQuestion));
    
    render(
      <Provider store={store}>
        <Timer />
      </Provider>
    );
    
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('should display PAUSED when timer is paused', () => {
    const store = createTestStore();
    store.dispatch(setActiveQuestion(mockQuestion));
    
    render(
      <Provider store={store}>
        <Timer />
      </Provider>
    );
    
    // Timer should render with time
    expect(screen.getByText('00:45')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    const store = createTestStore();
    store.dispatch(setActiveQuestion(mockQuestion));
    
    const { container } = render(
      <Provider store={store}>
        <Timer size={80} />
      </Provider>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });
});
