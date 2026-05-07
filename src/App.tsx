import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage';
import TeamSetupPage from './pages/TeamSetupPage/TeamSetupPage';
import GameBoardPage from './pages/GameBoardPage/GameBoardPage';
import FinalRoundPage from './pages/FinalRoundPage/FinalRoundPage';
import ResultPage from './pages/ResultPage/ResultPage';
import SetManagementPage from './pages/SetManagementPage/SetManagementPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/team-setup" element={<TeamSetupPage />} />
        <Route path="/game" element={<GameBoardPage />} />
        <Route path="/final-round" element={<FinalRoundPage />} />
        <Route path="/results" element={<ResultPage />} />
        <Route path="/sets" element={<SetManagementPage />} />
      </Routes>
    </Router>
  );
}

export default App;
