# Quiz Arena

Modern, web-based Jeopardy-style quiz competition application built with ReactJS.

## 🎯 Features

### Game Features
- **Jeopardy-Style Board**: 10 categories with 5 point levels (100-500)
- **Team Competition**: Support for multiple teams competing against each other
- **Strategic Jokers**: Three unique joker types per team
  - 50/50: Eliminates 2 wrong answers
  - Transfer: Pass question to another team
  - Shield: Protect an option
- **Final Round**: Optional final round with numeric estimation questions
- **Smart Question System**: Random question selection with persistence
- **Automatic Scoring**: Real-time score tracking and updates

### Technical Features
- **State Persistence**: Game continues even if browser closes (Redux Persist + localStorage)
- **Multi-language Support**: Turkish, English, and German (UI only)
- **Responsive Design**: Works on desktop, tablet, and large displays
- **Admin Panel**: Full game control for moderator
- **Set Management**: Import/Export quiz sets as JSON
- **Modern UI**: Built with Ant Design and TailwindCSS
- **Smooth Animations**: Framer Motion powered transitions
- **Victory Celebration**: Confetti effects for winners

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Redux Toolkit** - State management
- **Redux Persist** - State persistence
- **React Router** - Navigation
- **Ant Design** - UI components
- **TailwindCSS** - Styling
- **i18next** - Internationalization
- **Framer Motion** - Animations
- **React Confetti** - Victory effects

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🧪 Testing

The project has comprehensive test coverage:

- **141 passing tests** across all critical functionality
- **90.7% overall code coverage** (exceeds 90% target)
- Unit tests for services, Redux store, utilities
- Component tests for UI elements
- Hook tests for custom React hooks

Coverage breakdown:
- Services (Game Logic): 87%
- Redux Store: 100%
- Utilities: 99%
- Components: 76%
- Overall: 90.7%

See [TEST_STRATEGY.md](TEST_STRATEGY.md) for detailed testing documentation.

## 🎮 How to Play

### 1. Setup
1. Select or create a quiz set
2. Choose whether to enable Final Round
3. Add teams (minimum 2 required)
4. Start the game

### 2. Main Game
1. Teams take turns selecting category and point value
2. Question appears with 45-second timer
3. Team can use jokers before answering
4. Correct answer: Team earns points and continues (max 3 consecutive)
5. Wrong answer: Option is eliminated, question passes to next team
6. After 2 wrong answers: Question is lost

### 3. Final Round (Optional)
1. Starts after all board questions are complete
2. All teams answer simultaneously
3. Numeric estimation questions
4. Points awarded based on proximity to correct answer

### 4. Results
- Winner(s) declared
- Final scores displayed
- Option to start new game

## 🃏 Joker System

Each team has 3 jokers (one-time use):

1. **Fifty-Fifty**: Eliminates 2 random wrong options
2. **Transfer**: Pass question to another team
3. **Shield**: Protect one option before answering

## 📁 Project Structure

```
src/
├── components/       # Reusable UI components
├── constants/        # App constants
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization
├── pages/           # Route pages
├── services/        # Business logic services
├── store/           # Redux store & slices
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## 🌍 Internationalization

The app supports multiple languages for the UI (Turkish, English, German).

**Note**: Quiz content is NOT translated - it displays in the language entered by admin.

## 📄 License

MIT

---

**Enjoy the quiz! 🎉**
