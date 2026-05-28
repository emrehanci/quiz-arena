import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Input, List, Typography, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { addTeam, removeTeam, setPhase } from '../../store/gameSlice';
import { createTeam } from '../../utils/helpers';
import { GamePhase } from '../../types';
import { soundService } from '../../utils/soundService';

const { Title } = Typography;

const TeamSetupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const teams = useAppSelector(state => state.game.teams);
  const [teamName, setTeamName] = useState('');

  const handleAddTeam = () => {
    if (!teamName.trim()) {
      message.warning(t('teamSetup.teamNameRequired'));
      return;
    }

    const newTeam = createTeam(teamName.trim());
    dispatch(addTeam(newTeam));
    setTeamName('');
    message.success(t('teamSetup.teamAdded'));
  };

  const handleRemoveTeam = (teamId: string) => {
    dispatch(removeTeam(teamId));
    message.success(t('teamSetup.teamRemoved'));
  };

  const handleStartGame = () => {
    if (teams.length < 2) {
      message.error(t('teamSetup.minTeamsRequired'));
      return;
    }

    // Play start sound
    soundService.playStart();

    dispatch(setPhase(GamePhase.BOARD));
    navigate('/game');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTeam();
    }
  };

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
            <div className="mb-6">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="mb-4"
              >
                {t('common.back')}
              </Button>
              <Title level={2} className="text-center mb-0">
                {t('teamSetup.title')}
              </Title>
            </div>

            {/* Add Team Input */}
            <div className="mb-6">
              <Space.Compact className="w-full">
                <Input
                  size="large"
                  placeholder={t('teamSetup.enterTeamName')}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={handleAddTeam}
                >
                  {t('teamSetup.addTeam')}
                </Button>
              </Space.Compact>
            </div>

            {/* Teams List */}
            <div className="mb-6">
              {teams.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  {t('teamSetup.minTeamsRequired')}
                </div>
              ) : (
                <List
                  dataSource={teams}
                  renderItem={(team, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      key={team.id}
                    >
                      <List.Item
                        actions={[
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveTeam(team.id)}
                          >
                            {t('teamSetup.removeTeam')}
                          </Button>,
                        ]}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <span className="text-lg font-semibold">
                            {team.name}
                          </span>
                        </div>
                      </List.Item>
                    </motion.div>
                  )}
                />
              )}
            </div>

            {/* Start Game Button */}
            <div className="text-center">
              <Button
                type="primary"
                size="large"
                onClick={handleStartGame}
                disabled={teams.length < 2}
                className="h-14 px-12 text-lg"
              >
                {t('teamSetup.startGame')}
              </Button>
              {teams.length < 2 && (
                <div className="mt-2 text-red-500 text-sm">
                  {t('teamSetup.minTeamsRequired')}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default TeamSetupPage;
