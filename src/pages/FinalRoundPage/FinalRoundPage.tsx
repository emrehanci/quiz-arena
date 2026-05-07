import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, InputNumber, Table, Typography, Space, message } from 'antd';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import {
  nextFinalRoundQuestion,
  addFinalRoundAnswers,
  endFinalRound,
  updateMultipleTeams,
} from '../../store/gameSlice';
import { GameLogicService } from '../../services/gameLogic';
import type { FinalRoundAnswer } from '../../types';
import { FINAL_ROUND_QUESTION_COUNT } from '../../constants';

const { Title, Text } = Typography;

const FinalRoundPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { sets } = useAppSelector(state => state.settings);
  const { activeSetId, teams, finalRound } = useAppSelector(state => state.game);

  const activeSet = sets.find(s => s.id === activeSetId);
  const currentQuestion = activeSet?.finalRoundQuestions[finalRound.currentQuestionIndex];

  const [teamAnswers, setTeamAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [rankings, setRankings] = useState<Array<{ teamId: string; rank: number; difference: number }>>([]);

  if (!activeSet || !currentQuestion) {
    navigate('/results');
    return null;
  }

  const handleAnswerChange = (teamId: string, value: number | null) => {
    setTeamAnswers(prev => ({
      ...prev,
      [teamId]: value || 0,
    }));
  };

  const handleSubmitAnswers = () => {
    // Validate all teams have answered
    const allAnswered = teams.every(team => team.id in teamAnswers);
    if (!allAnswered) {
      message.warning('All teams must provide answers');
      return;
    }

    // Convert to FinalRoundAnswer array
    const answers: FinalRoundAnswer[] = teams.map(team => ({
      teamId: team.id,
      answer: teamAnswers[team.id] || 0,
    }));

    // Calculate rankings
    const calculatedRankings = GameLogicService.calculateFinalRoundRankings(
      answers,
      currentQuestion.correctAnswer
    );

    setRankings(calculatedRankings);
    setShowResults(true);

    // Apply points
    const updatedTeams = GameLogicService.applyFinalRoundPoints(teams, calculatedRankings);
    dispatch(updateMultipleTeams(updatedTeams));

    // Save answers
    dispatch(addFinalRoundAnswers({
      questionId: currentQuestion.id,
      answers,
    }));
  };

  const handleNextQuestion = () => {
    const nextIndex = finalRound.currentQuestionIndex + 1;
    
    if (nextIndex >= FINAL_ROUND_QUESTION_COUNT || nextIndex >= activeSet.finalRoundQuestions.length) {
      // Final round is complete
      dispatch(endFinalRound());
      navigate('/results');
    } else {
      // Move to next question
      dispatch(nextFinalRoundQuestion());
      setTeamAnswers({});
      setShowResults(false);
      setRankings([]);
    }
  };

  const resultsColumns = [
    {
      title: t('finalRound.rank'),
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: number) => (
        <span className="text-2xl font-bold">{rank}</span>
      ),
    },
    {
      title: t('results.team'),
      dataIndex: 'teamId',
      key: 'team',
      render: (teamId: string) => {
        const team = teams.find(t => t.id === teamId);
        return <span className="text-lg font-semibold">{team?.name}</span>;
      },
    },
    {
      title: t('finalRound.answer'),
      dataIndex: 'teamId',
      key: 'answer',
      render: (teamId: string) => teamAnswers[teamId],
    },
    {
      title: t('finalRound.difference'),
      dataIndex: 'difference',
      key: 'difference',
    },
    {
      title: t('finalRound.pointsAwarded'),
      dataIndex: 'rank',
      key: 'points',
      render: (rank: number) => {
        const points = GameLogicService.getFinalRoundPoints(rank);
        return <span className="text-lg font-bold text-green-600">{points}</span>;
      },
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-4 md:p-8">
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
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl">
            <div className="text-center mb-6">
              <Title level={2}>{t('finalRound.title')}</Title>
              <Text className="text-lg">
                {t('finalRound.question')} {finalRound.currentQuestionIndex + 1} / {FINAL_ROUND_QUESTION_COUNT}
              </Text>
            </div>

            {/* Question */}
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <Title level={3} className="text-center mb-4">
                {currentQuestion.questionText}
              </Title>
            </div>

            {!showResults ? (
              <>
                {/* Team Answer Inputs */}
                <Space direction="vertical" className="w-full" size="large">
                  {teams.map((team, index) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-gray-50">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold">{team.name}</span>
                          <InputNumber
                            size="large"
                            className="w-48"
                            placeholder={t('finalRound.enterAnswer')}
                            value={teamAnswers[team.id]}
                            onChange={(value) => handleAnswerChange(team.id, value)}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </Space>

                {/* Submit Button */}
                <div className="text-center mt-6">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmitAnswers}
                    className="h-14 px-12 text-lg"
                  >
                    {t('finalRound.submitAnswers')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Results Table */}
                <div className="mb-6">
                  <Title level={4} className="mb-4">
                    {t('finalRound.results')}
                  </Title>
                  <Table
                    dataSource={rankings}
                    columns={resultsColumns}
                    rowKey="teamId"
                    pagination={false}
                  />
                </div>

                {/* Correct Answer */}
                <div className="bg-green-50 p-4 rounded-lg mb-6 text-center">
                  <Text className="text-lg">
                    {t('finalRound.correctAnswer')}: <strong>{currentQuestion.correctAnswer}</strong>
                  </Text>
                  <div className="mt-2">
                    <Text type="secondary">{currentQuestion.explanation}</Text>
                  </div>
                </div>

                {/* Next Button */}
                <div className="text-center">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleNextQuestion}
                    className="h-14 px-12 text-lg"
                  >
                    {finalRound.currentQuestionIndex + 1 >= FINAL_ROUND_QUESTION_COUNT
                      ? t('finalRound.finishRound')
                      : t('finalRound.nextQuestion')}
                  </Button>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default FinalRoundPage;
