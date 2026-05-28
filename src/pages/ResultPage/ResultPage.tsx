import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, Typography } from 'antd';
import { TrophyOutlined, HomeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { startNewGame } from '../../store/gameSlice';
import { GameLogicService } from '../../services/gameLogic';
import { soundService } from '../../utils/soundService';

const { Title, Text } = Typography;

const ResultPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const teams = useAppSelector(state => state.game.teams);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Play victory sound
    soundService.playVictory();
    
    // Stop confetti after 10 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleNewGame = () => {
    dispatch(startNewGame());
    navigate('/');
  };

  const winners = GameLogicService.getWinners(teams);
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const columns = [
    {
      title: '#',
      key: 'rank',
      render: (_: any, __: any, index: number) => (
        <span className="text-2xl font-bold">{index + 1}</span>
      ),
    },
    {
      title: t('results.team'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div className="flex items-center gap-2">
          {winners.some(w => w.id === record.id) && (
            <TrophyOutlined className="text-yellow-500 text-3xl" />
          )}
          <span className={`text-xl font-bold ${winners.some(w => w.id === record.id) ? 'text-yellow-600' : ''}`}>
            {name}
          </span>
        </div>
      ),
    },
    {
      title: t('results.score'),
      dataIndex: 'score',
      key: 'score',
      align: 'right' as const,
      render: (score: number) => (
        <span className="text-2xl font-bold text-green-600">{score}</span>
      ),
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
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={200}
        />
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <TrophyOutlined className="text-8xl text-yellow-500 mb-4" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Title level={1} className="mb-2">
                  {t('results.congratulations')}
                </Title>
                <Title level={2} className="text-yellow-600">
                  {winners.length === 1
                    ? `${t('results.winner')}: ${winners[0].name}`
                    : `${t('results.winners')}: ${winners.map(w => w.name).join(', ')}`}
                </Title>
              </motion.div>
            </div>

            {/* Scores Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Title level={3} className="text-center mb-4">
                {t('results.finalScores')}
              </Title>
              <Table
                dataSource={sortedTeams}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="large"
                rowClassName={(record) =>
                  winners.some(w => w.id === record.id) ? 'bg-yellow-50' : ''
                }
              />
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8"
            >
              <Button
                type="primary"
                size="large"
                icon={<HomeOutlined />}
                onClick={handleNewGame}
                className="h-14 px-12 text-lg"
              >
                {t('results.newGame')}
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default ResultPage;
