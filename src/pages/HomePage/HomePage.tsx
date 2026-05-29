import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Select, Modal, Typography, Space } from 'antd';
import {
  PlayCircleOutlined,
  SettingOutlined,
  GlobalOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { setActiveSet, resetGame } from '../../store/gameSlice';
import { setLanguage } from '../../store/settingsSlice';
import { GamePhase } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../constants';

const { Title } = Typography;

const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { sets, language } = useAppSelector(state => state.settings);
  const { phase, activeSetId } = useAppSelector(state => state.game);
  
  const [setSelectModalVisible, setSetSelectModalVisible] = useState(false);
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [finalRoundEnabled, setFinalRoundEnabled] = useState(true);
  const [resetModalVisible, setResetModalVisible] = useState(false);

  const hasActiveGame = phase !== GamePhase.NOT_STARTED && activeSetId;

  const handleStartNewGame = () => {
    setSetSelectModalVisible(true);
  };

  const handleSetSelect = () => {
    const selectedSet = sets.find(s => s.id === selectedSetId);
    if (selectedSet) {
      dispatch(setActiveSet({ 
        setId: selectedSetId, 
        finalRoundEnabled: finalRoundEnabled && selectedSet.finalRoundEnabled 
      }));
      navigate('/team-setup');
    }
  };

  const handleContinueGame = () => {
    if (phase === GamePhase.TEAM_SETUP) {
      navigate('/team-setup');
    } else if (phase === GamePhase.BOARD || phase === GamePhase.QUESTION) {
      navigate('/game');
    } else if (phase === GamePhase.FINAL_ROUND) {
      navigate('/final-round');
    } else if (phase === GamePhase.RESULTS) {
      navigate('/results');
    }
  };

  const handleManageSets = () => {
    navigate('/sets');
  };

  const handleTutorial = () => {
    navigate('/tutorial');
  };

  const handleLanguageChange = (lang: string) => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  };

  const handleResetGame = () => {
    setResetModalVisible(true);
  };

  const confirmResetGame = () => {
    dispatch(resetGame());
    setResetModalVisible(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl relative z-10"
      >
        <Card className="shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <TrophyOutlined className="text-6xl text-yellow-500 mb-4" />
              <Title level={1} className="text-blue-600 mb-2">
                {t('common.appName')}
              </Title>
              <p className="text-gray-600">{t('home.title')}</p>
            </motion.div>
          </div>

          <Space direction="vertical" className="w-full" size="large">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleStartNewGame}
                block
                className="h-14 text-lg"
              >
                {t('home.startNewGame')}
              </Button>
            </motion.div>

            {hasActiveGame && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    size="large"
                    onClick={handleContinueGame}
                    block
                    className="h-14 text-lg"
                  >
                    {t('home.continueGame')}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Button
                    danger
                    size="large"
                    icon={<ReloadOutlined />}
                    onClick={handleResetGame}
                    block
                    className="h-14 text-lg"
                  >
                    {t('home.resetGame')}
                  </Button>
                </motion.div>
              </>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="large"
                icon={<SettingOutlined />}
                onClick={handleManageSets}
                block
                className="h-14 text-lg"
              >
                {t('home.manageSet')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Button
                size="large"
                icon={<QuestionCircleOutlined />}
                onClick={handleTutorial}
                block
                className="h-14 text-lg"
                type="default"
              >
                {t('home.howToPlay')}
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-xl" />
                <span>{t('home.selectLanguage')}:</span>
                <Select
                  value={language}
                  onChange={handleLanguageChange}
                  className="flex-1"
                  options={SUPPORTED_LANGUAGES.map(lang => ({
                    label: lang.toUpperCase(),
                    value: lang,
                  }))}
                />
              </div>
            </motion.div>
          </Space>
        </Card>
      </motion.div>

      {/* Set Selection Modal */}
      <Modal
        title={t('home.startNewGame')}
        open={setSelectModalVisible}
        onOk={handleSetSelect}
        onCancel={() => setSetSelectModalVisible(false)}
        okText={t('common.start')}
        cancelText={t('common.cancel')}
        okButtonProps={{ disabled: !selectedSetId }}
      >
        <Space direction="vertical" className="w-full" size="middle">
          <div>
            <label className="block mb-2">{t('setManagement.setName')}</label>
            <Select
              className="w-full"
              value={selectedSetId || undefined}
              onChange={(value) => {
                setSelectedSetId(value);
                const set = sets.find(s => s.id === value);
                if (set) {
                  setFinalRoundEnabled(set.finalRoundEnabled);
                }
              }}
              options={sets.map(set => ({
                label: set.name,
                value: set.id,
              }))}
              placeholder={t('setManagement.setName')}
            />
          </div>
          
          {selectedSetId && sets.find(s => s.id === selectedSetId)?.finalRoundEnabled && (
            <div>
              <label className="block mb-2">
                {t('setManagement.finalRoundEnabled')}
              </label>
              <Select
                className="w-full"
                value={finalRoundEnabled}
                onChange={setFinalRoundEnabled}
                options={[
                  { label: t('common.yes'), value: true },
                  { label: t('common.no'), value: false },
                ]}
              />
            </div>
)}
        </Space>
      </Modal>

      {/* Reset Game Confirmation Modal */}
      <Modal
        title={
          <span>
            <ExclamationCircleOutlined className="text-orange-500 mr-2" />
            {t('home.resetGameConfirmTitle')}
          </span>
        }
        open={resetModalVisible}
        onOk={confirmResetGame}
        onCancel={() => setResetModalVisible(false)}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
        okButtonProps={{ danger: true }}
      >
        <p>{t('home.resetGameConfirmMessage')}</p>
      </Modal>
    </div>
  );
};

export default HomePage;
