import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, message, Modal } from 'antd';
import { SettingOutlined, StarFilled, FireOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  setActiveQuestion,
  clearActiveQuestion,
  updateTeam,
  updateMultipleTeams,
  nextTeam,
  addAnsweredQuestion,
  addLostQuestion,
  incrementWrongAttempts,
  addEliminatedOption,
  setEliminatedOptions,
  setShieldedOption,
  setTransferInfo,
  useJoker,
  resetTeamTurnJokers,
  setCurrentTeamIndex,
  pauseTimer,
  resumeTimer,
  resetTimer,
  updateTeamScore,
  startFinalRound,
  setPhase,
} from '../../store/gameSlice';
import { GameLogicService } from '../../services/gameLogic';
import { MAX_WRONG_ATTEMPTS } from '../../constants';
import { GamePhase } from '../../types';
import { soundService } from '../../utils/soundService';
import Board from '../../components/Board/Board';
import Scoreboard from '../../components/Scoreboard/Scoreboard';
import QuestionCard from '../../components/QuestionCard/QuestionCard';
import AdminPanel from '../../components/AdminPanel/AdminPanel';

const GameBoardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { sets } = useAppSelector(state => state.settings);
  const {
    activeSetId,
    teams,
    currentTeamIndex,
    activeQuestion,
    answeredQuestions,
    lostQuestions,
    isFinalRoundEnabled,
  } = useAppSelector(state => state.game);

  const [adminPanelVisible, setAdminPanelVisible] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const activeSet = sets.find(s => s.id === activeSetId);

  useEffect(() => {
    if (!activeSet || teams.length === 0) {
      navigate('/');
    }
  }, [activeSet, teams, navigate]);

  useEffect(() => {
    // Reset explanation state when question is closed
    if (!activeQuestion) {
      setShowExplanation(false);
    }
  }, [activeQuestion]);

  useEffect(() => {
    // Check if all questions are completed
    if (activeSet && GameLogicService.areAllQuestionsCompleted(activeSet, answeredQuestions, lostQuestions)) {
      handleAllQuestionsCompleted();
    }
  }, [answeredQuestions, lostQuestions]);

  const handleAllQuestionsCompleted = () => {
    Modal.confirm({
      title: t('gameBoard.allQuestionsCompleted'),
      content: isFinalRoundEnabled 
        ? t('admin.startFinalRound') 
        : t('results.title'),
      okText: isFinalRoundEnabled ? t('admin.startFinalRound') : t('results.title'),
      cancelText: t('common.cancel'),
      onOk: () => {
        if (isFinalRoundEnabled) {
          dispatch(startFinalRound());
          navigate('/final-round');
        } else {
          dispatch(setPhase(GamePhase.RESULTS));
          navigate('/results');
        }
      },
    });
  };

  const handleSelectQuestion = (categoryId: string, point: number) => {
    if (!activeSet) return;
    
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;

    const question = GameLogicService.getRandomQuestion(
      activeSet,
      categoryId,
      point,
      answeredQuestions,
      lostQuestions
    );

    if (!question) {
      message.error('No question available');
      return;
    }

    // Reset explanation state for new question
    setShowExplanation(false);
    dispatch(setActiveQuestion(question));
  };

  const handleAnswer = (optionId: string) => {
    if (!activeQuestion) return;
    
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;

    const isCorrect = optionId === activeQuestion.question.correctOptionId;

    if (isCorrect) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer(optionId);
    }
  };

  const handleCorrectAnswer = () => {
    if (!activeQuestion) return;

    const points = activeQuestion.question.point;
    
    // Get fresh team state from Redux store
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;
    
    let updatedTeam = freshCurrentTeam;

    // Check if this is a transferred question
    if (activeQuestion.isTransferred && activeQuestion.transferredFromTeamId && activeQuestion.transferredToTeamId) {
      const updatedTeams = GameLogicService.handleTransferCorrect(
        teams,
        activeQuestion.transferredFromTeamId,
        activeQuestion.transferredToTeamId,
        points
      );
      dispatch(updateMultipleTeams(updatedTeams));
      // Find the team that answered (transferredToTeamId)
      updatedTeam = updatedTeams.find(t => t.id === activeQuestion.transferredToTeamId) || freshCurrentTeam;
      
      // Transfer successful: return to the team that transferred
      const transferrerTeamIndex = teams.findIndex(t => t.id === activeQuestion.transferredFromTeamId);
      if (transferrerTeamIndex !== -1) {
        dispatch(setCurrentTeamIndex(transferrerTeamIndex));
        // Reset joker counter for the team getting the turn back
        const transferrerTeam = teams[transferrerTeamIndex];
        if (transferrerTeam) {
          dispatch(resetTeamTurnJokers(transferrerTeam.id));
        }
      }
    } else {
      updatedTeam = GameLogicService.handleCorrectAnswer(freshCurrentTeam, points);
      dispatch(updateTeam(updatedTeam));
    }

    // Add to answered questions
    dispatch(addAnsweredQuestion({
      categoryId: activeQuestion.question.categoryId,
      point: activeQuestion.question.point,
      questionId: activeQuestion.question.id,
    }));

    // Show explanation
    setShowExplanation(true);
    dispatch(pauseTimer());
    message.success(t('question.correctAnswer'));
    
    // Play success sound
    soundService.playSuccess();

    // Check if team can continue with updated consecutive count
    // Skip this check for transferred questions (turn already returned to transferrer)
    if (!activeQuestion.isTransferred && !GameLogicService.canTeamContinue(updatedTeam)) {
      // Team has reached max consecutive, move to next team
      const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
      const nextTeamData = teams[nextTeamIndex];
      dispatch(nextTeam());
      // Reset joker counter for the new team
      if (nextTeamData) {
        dispatch(resetTeamTurnJokers(nextTeamData.id));
      }
    }
    // If team can continue, they stay as current team
  };

  const handleWrongAnswer = (selectedOptionId: string) => {
    if (!activeQuestion) return;
    
    // Get fresh team state from Redux store
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;

    const points = activeQuestion.question.point;

    // Check if shield was used
    const shieldWasUsed = activeQuestion.shieldedOptionId !== undefined;
    
    // Check if shield protects this specific option
    const shieldProtectsThisOption = activeQuestion.shieldedOptionId === selectedOptionId;
    
    if (shieldProtectsThisOption) {
      // Shield protected this option, eliminate it and allow retry
      message.info('Shield protected! Try again.');
      dispatch(addEliminatedOption(selectedOptionId));
      return;
    }

    // Increment wrong attempts
    dispatch(incrementWrongAttempts());
    const newWrongAttempts = activeQuestion.wrongAttempts + 1;

    // Handle transferred question wrong answer
    if (activeQuestion.isTransferred && activeQuestion.transferredFromTeamId && activeQuestion.transferredToTeamId) {
      const updatedTeams = GameLogicService.handleTransferWrong(
        teams,
        activeQuestion.transferredFromTeamId,
        activeQuestion.transferredToTeamId,
        points
      );
      dispatch(updateMultipleTeams(updatedTeams));

      // Mark as lost
      dispatch(addLostQuestion({
        categoryId: activeQuestion.question.categoryId,
        point: activeQuestion.question.point,
        questionId: activeQuestion.question.id,
      }));

      setShowExplanation(true);
      dispatch(pauseTimer());
      message.error(t('question.wrongAnswer'));
      
      // Play fail sound
      soundService.playFail();
      
      // Transfer failed, return to the team that transferred (transferredFromTeamId)
      const transferrerTeamIndex = teams.findIndex(t => t.id === activeQuestion.transferredFromTeamId);
      if (transferrerTeamIndex !== -1) {
        dispatch(setCurrentTeamIndex(transferrerTeamIndex));
        // Reset joker counter for the team getting the turn back
        const transferrerTeam = teams[transferrerTeamIndex];
        if (transferrerTeam) {
          dispatch(resetTeamTurnJokers(transferrerTeam.id));
        }
      }
      return;
    }

    // Add eliminated option
    dispatch(addEliminatedOption(selectedOptionId));
    
    // Check if fifty-fifty was used (2 options eliminated means 50/50 joker was used)
    // Note: We add 1 to length because we just dispatched addEliminatedOption above
    const currentEliminatedCount = activeQuestion.eliminatedOptions.length + 1;
    const fiftyFiftyWasUsed = currentEliminatedCount >= 2;

    // ALWAYS reset consecutive count on wrong answer (including shield)
    // Wrong answer = streak is broken, regardless of who continues
    const updatedTeam = GameLogicService.resetConsecutiveCount(freshCurrentTeam);
    dispatch(updateTeam(updatedTeam));
    
    // Reset joker counter when streak breaks
    dispatch(resetTeamTurnJokers(freshCurrentTeam.id));

    // Check if question should be lost
    // - After 2 wrong attempts OR
    // - If fifty-fifty was used and answer is wrong OR
    // - If shield was used but didn't protect (wrong option was selected)
    if (newWrongAttempts >= MAX_WRONG_ATTEMPTS || fiftyFiftyWasUsed || shieldWasUsed) {
      // Question is lost
      dispatch(addLostQuestion({
        categoryId: activeQuestion.question.categoryId,
        point: activeQuestion.question.point,
        questionId: activeQuestion.question.id,
      }));

      setShowExplanation(true);
      dispatch(pauseTimer());
      message.error(t('question.wrongAnswer') + ' - Question lost!');
      
      // Play fail sound
      soundService.playFail();
      
      // Shield: team continues (turn stays)
      // Fifty-Fifty or 2nd wrong: move to next team
      if (!shieldWasUsed) {
        const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
        const nextTeamData = teams[nextTeamIndex];
        dispatch(nextTeam());
        // Reset joker counter for the new team
        if (nextTeamData) {
          dispatch(resetTeamTurnJokers(nextTeamData.id));
        }
      }
    } else {
      // First wrong attempt - eliminate option and pass to next team
      // Question stays active for next team
      message.warning(t('question.wrongAnswer') + ' - Next team\'s turn!');
      
      // Play fail sound
      soundService.playFail();
      
      // Calculate next team index and reset their consecutive count
      // When a team receives a question from another team, their streak is reset
      const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
      const nextTeamData = teams[nextTeamIndex];
      const resetNextTeamData = GameLogicService.resetConsecutiveCount(nextTeamData);
      dispatch(updateTeam(resetNextTeamData));
      
      // Reset timer for next team
      dispatch(resetTimer());
      // Move to next team but keep question active
      dispatch(nextTeam());
      // Reset joker counter for the new team
      if (nextTeamData) {
        dispatch(resetTeamTurnJokers(nextTeamData.id));
      }
    }
  };

  const handleUseFiftyFifty = () => {
    if (!activeQuestion) return;
    
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;

    const newEliminatedOptions = GameLogicService.applyFiftyFifty(
      activeQuestion.question,
      activeQuestion.eliminatedOptions
    );

    dispatch(setEliminatedOptions(newEliminatedOptions));
    dispatch(useJoker({ teamId: freshCurrentTeam.id, jokerType: 'fiftyFiftyUsed' }));
    message.success(t('jokers.fiftyFifty') + ' ' + t('jokers.used'));
  };

  const handleUseTransfer = (toTeamId: string) => {
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;

    dispatch(setTransferInfo({ fromTeamId: freshCurrentTeam.id, toTeamId }));
    dispatch(useJoker({ teamId: freshCurrentTeam.id, jokerType: 'transferUsed' }));
    message.success(t('jokers.transfer') + ' ' + t('jokers.used'));
  };

  const handleUseShield = (optionId: string) => {
    const freshCurrentTeam = teams[currentTeamIndex];
    if (!freshCurrentTeam) return;

    dispatch(setShieldedOption(optionId));
    dispatch(useJoker({ teamId: freshCurrentTeam.id, jokerType: 'shieldUsed' }));
    message.success(t('jokers.shield') + ' ' + t('jokers.used'));
  };

  const handleMarkAsLost = () => {
    if (!activeQuestion) return;

    // Mark question as lost
    dispatch(addLostQuestion({
      categoryId: activeQuestion.question.categoryId,
      point: activeQuestion.question.point,
      questionId: activeQuestion.question.id,
    }));

    // Clear active question and explanation
    setShowExplanation(false);
    dispatch(clearActiveQuestion());
    
    message.warning('Question marked as lost. Current team continues.');
  };

  if (!activeSet) {
    return null;
  }
  
  // Get current team for render
  const currentTeamForRender = teams[currentTeamIndex];
  if (!currentTeamForRender) {
    return null;
  }

  const otherTeams = teams.filter(t => t.id !== currentTeamForRender.id);

  const canStartFinalRound = 
    isFinalRoundEnabled && 
    GameLogicService.areAllQuestionsCompleted(activeSet, answeredQuestions, lostQuestions);

  return (
    <div className="min-h-screen relative overflow-hidden p-4">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header - Sticky */}
        <div className="sticky top-0 z-50 bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{t('gameBoard.title')}</h1>
          <Button
            icon={<SettingOutlined />}
            onClick={() => setAdminPanelVisible(true)}
            size="large"
            type="primary"
          >
            {t('admin.title')}
          </Button>
        </div>

        {/* Current Turn */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center shadow-lg">
            <span className="text-lg font-semibold flex items-center justify-center gap-2">
              <StarFilled className="text-yellow-300" />
              {t('gameBoard.currentTurn')}: {currentTeamForRender.name} 
              <span className="flex items-center gap-1">
                ({currentTeamForRender.consecutiveCorrectCount}/3)
                {currentTeamForRender.consecutiveCorrectCount > 0 && (
                  <FireOutlined className="text-orange-400" />
                )}
              </span>
            </span>
          </div>
        </motion.div>

        {/* Scoreboard */}
        <div className="mb-4">
          <Scoreboard teams={teams} currentTeamId={currentTeamForRender.id} />
        </div>

        {/* Game Board */}
        <div className="mb-4">
          <Board
            set={activeSet}
            answeredQuestions={answeredQuestions}
            lostQuestions={lostQuestions}
            onSelectQuestion={handleSelectQuestion}
            disabled={!!activeQuestion}
          />
        </div>

        {/* Question Modal */}
        {activeQuestion && (
          <QuestionCard
            question={activeQuestion.question}
            eliminatedOptions={activeQuestion.eliminatedOptions}
            shieldedOptionId={activeQuestion.shieldedOptionId}
            onAnswer={handleAnswer}
            onClose={() => {
              setShowExplanation(false);
              dispatch(clearActiveQuestion());
            }}
            visible={true}
            showExplanation={showExplanation}
            correctOptionId={showExplanation ? activeQuestion.question.correctOptionId : undefined}
            currentTeam={currentTeamForRender}
            otherTeams={otherTeams}
            onUseFiftyFifty={handleUseFiftyFifty}
            onUseTransfer={handleUseTransfer}
            onUseShield={handleUseShield}
            isTransferred={activeQuestion.isTransferred}
            onMarkAsLost={handleMarkAsLost}
            onOpenAdminPanel={() => setAdminPanelVisible(true)}
          />
        )}

        {/* Admin Panel */}
        <AdminPanel
          visible={adminPanelVisible}
          onClose={() => setAdminPanelVisible(false)}
          teams={teams}
          currentTeamIndex={currentTeamIndex}
          onChangeTeam={(index) => dispatch(setCurrentTeamIndex(index))}
          onPauseTimer={() => dispatch(pauseTimer())}
          onResumeTimer={() => dispatch(resumeTimer())}
          onResetTimer={() => dispatch(resetTimer())}
          onUpdateScore={(teamId, score) => dispatch(updateTeamScore({ teamId, score }))}
          onMarkAsAnswered={() => {
            if (activeQuestion) {
              dispatch(addAnsweredQuestion({
                categoryId: activeQuestion.question.categoryId,
                point: activeQuestion.question.point,
                questionId: activeQuestion.question.id,
              }));
              dispatch(clearActiveQuestion());
            }
          }}
          onMarkAsLost={() => {
            if (activeQuestion) {
              dispatch(addLostQuestion({
                categoryId: activeQuestion.question.categoryId,
                point: activeQuestion.question.point,
                questionId: activeQuestion.question.id,
              }));
              dispatch(clearActiveQuestion());
            }
          }}
          onCancelQuestion={() => dispatch(clearActiveQuestion())}
          onStartFinalRound={() => {
            dispatch(startFinalRound());
            navigate('/final-round');
          }}
          onSkipFinalRound={() => {
            dispatch(setPhase(GamePhase.RESULTS));
            navigate('/results');
          }}
          onEndGame={() => {
            Modal.confirm({
              title: 'End Game?',
              content: 'Are you sure you want to end the game and go to results?',
              okText: 'Yes, End Game',
              cancelText: 'Cancel',
              okButtonProps: { danger: true },
              onOk: () => {
                dispatch(setPhase(GamePhase.RESULTS));
                dispatch(clearActiveQuestion());
                navigate('/results');
              },
            });
          }}
          hasActiveQuestion={!!activeQuestion}
          timerPaused={activeQuestion?.timerPaused || false}
          canStartFinalRound={canStartFinalRound}
        />
      </div>
    </div>
  );
};

export default GameBoardPage;
