import React, { useState, useEffect } from 'react';
import { Modal, Button, Radio, Space, Alert } from 'antd';
import { SettingOutlined, QuestionCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, SafetyOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Question, Option, Team } from '../../types';
import Timer from '../Timer/Timer';
import JokerPanel from '../JokerPanel/JokerPanel';
import { soundService } from '../../utils/soundService';

interface QuestionCardProps {
  question: Question;
  eliminatedOptions: string[];
  shieldedOptionId?: string;
  onAnswer: (optionId: string) => void;
  onClose: () => void;
  visible: boolean;
  showExplanation?: boolean;
  correctOptionId?: string;
  // Joker props
  currentTeam?: Team;
  otherTeams?: Team[];
  onUseFiftyFifty?: () => void;
  onUseTransfer?: (toTeamId: string) => void;
  onUseShield?: (optionId: string) => void;
  isTransferred?: boolean;
  // Manual control
  onMarkAsLost?: () => void;
  onOpenAdminPanel?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  eliminatedOptions,
  shieldedOptionId,
  onAnswer,
  onClose,
  visible,
  showExplanation = false,
  correctOptionId,
  onOpenAdminPanel,
  currentTeam,
  otherTeams = [],
  onUseFiftyFifty,
  onUseTransfer,
  onUseShield,
  isTransferred = false,
}) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFailAnimation, setShowFailAnimation] = useState(false);

  // Reset selection when modal closes or new question opens
  useEffect(() => {
    if (!visible) {
      setSelectedOption(null);
      setShowSuccessAnimation(false);
      setShowFailAnimation(false);
    }
  }, [visible]);

  // Play open sound when question becomes visible
  useEffect(() => {
    if (visible && !showExplanation) {
      soundService.playOpen();
    }
  }, [visible, showExplanation]);

  // Trigger success animation when correct answer is revealed
  useEffect(() => {
    if (showExplanation && correctOptionId && selectedOption === correctOptionId) {
      setShowSuccessAnimation(true);
      const timer = setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showExplanation, correctOptionId, selectedOption]);

  // Trigger fail animation when wrong answer is revealed
  useEffect(() => {
    if (showExplanation && correctOptionId && selectedOption && selectedOption !== correctOptionId) {
      setShowFailAnimation(true);
      const timer = setTimeout(() => {
        setShowFailAnimation(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showExplanation, correctOptionId, selectedOption]);

  const handleConfirm = () => {
    if (selectedOption && selectedOption !== shieldedOptionId) {
      // Trigger animations immediately based on answer
      if (selectedOption === question.correctOptionId) {
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 2000);
      } else {
        setShowFailAnimation(true);
        setTimeout(() => {
          setShowFailAnimation(false);
        }, 2000);
      }
      onAnswer(selectedOption);
      // Don't clear selectedOption so animation can trigger
    }
  };

  const isOptionDisabled = (optionId: string) => {
    return (
      eliminatedOptions.includes(optionId) || optionId === shieldedOptionId
    );
  };

  const getOptionClassName = (option: Option) => {
    const classes = ['p-4', 'rounded-lg', 'border-2', 'transition-all'];

    if (eliminatedOptions.includes(option.id)) {
      classes.push('bg-gray-200', 'text-gray-400', 'border-gray-300', 'line-through');
    } else if (option.id === shieldedOptionId) {
      classes.push('bg-yellow-100', 'border-yellow-500', 'cursor-not-allowed');
    } else if (showExplanation && correctOptionId) {
      if (option.id === correctOptionId) {
        classes.push('bg-green-100', 'border-green-500');
      } else if (option.id === selectedOption) {
        classes.push('bg-red-100', 'border-red-500');
      }
    } else if (selectedOption === option.id) {
      classes.push('bg-blue-100', 'border-blue-500');
    } else {
      classes.push('bg-white', 'border-gray-300', 'hover:border-blue-400');
    }

    return classes.join(' ');
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      closable={false}
      maskClosable={false}
    >
      <div className="p-6">
        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-green-500 rounded-full p-8 shadow-2xl"
              >
                <CheckCircleOutlined className="text-white text-9xl" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 0] }}
                transition={{ duration: 1.5, times: [0, 0.5, 1] }}
                className="absolute inset-0 rounded-full bg-green-400 opacity-30"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fail Animation Overlay */}
        <AnimatePresence>
          {showFailAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="bg-red-500 rounded-full p-8 shadow-2xl"
              >
                <CloseCircleOutlined className="text-white text-9xl" />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 0] }}
                transition={{ duration: 1.5, times: [0, 0.5, 1] }}
                className="absolute inset-0 rounded-full bg-red-400 opacity-30"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Button - Fixed top right */}
        {onOpenAdminPanel && (
          <Button
            icon={<SettingOutlined />}
            onClick={onOpenAdminPanel}
            className="absolute top-6 right-0 z-10"
            type="primary"
            size="middle"
            title="Admin Panel"
          />
        )}

        {/* Timer - only show during active question */}
        {!showExplanation && (
          <div className="flex justify-center mb-6">
            <Timer />
          </div>
        )}

        {/* Joker Panel - only show before explanation */}
        {!showExplanation && currentTeam && onUseFiftyFifty && onUseTransfer && onUseShield && (
          <div className="mb-6">
            <JokerPanel
              currentTeam={currentTeam}
              otherTeams={otherTeams}
              options={question.options}
              eliminatedOptions={eliminatedOptions}
              onUseFiftyFifty={onUseFiftyFifty}
              onUseTransfer={onUseTransfer}
              onUseShield={onUseShield}
              isTransferred={isTransferred}
              hasFiftyFiftyBeenUsed={eliminatedOptions.length > 0}
            />
          </div>
        )}

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
            <QuestionCircleOutlined className="text-blue-500" />
            {t('question.title')}
          </h2>
          {currentTeam && !showExplanation && (
            <div className="text-center mb-2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
                {currentTeam.name}
              </span>
            </div>
          )}
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xl text-center">{question.questionText}</p>
            
            {/* Question Media */}
            {question.media && (
              <div className="mt-4 flex justify-center">
                {question.media.type === 'image' && (
                  <img
                    src={question.media.url}
                    alt="Question image"
                    className="max-w-full max-h-96 rounded-lg shadow-md"
                  />
                )}
                {question.media.type === 'audio' && (
                  <audio
                    src={question.media.url}
                    controls
                    autoPlay={question.media.autoplay}
                    className="w-full max-w-md"
                  />
                )}
                {question.media.type === 'video' && (
                  <video
                    src={question.media.url}
                    controls
                    autoPlay={question.media.autoplay}
                    poster={question.media.thumbnailUrl}
                    className="max-w-full max-h-96 rounded-lg shadow-md"
                  />
                )}
              </div>
            )}
          </div>
          <div className="text-center mt-2">
            <span className="text-lg font-semibold text-blue-600 flex items-center justify-center gap-1">
              <TrophyOutlined /> {question.point} {t('question.points')}
            </span>
          </div>
        </motion.div>

        {/* Options */}
        <Radio.Group
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full"
          disabled={showExplanation}
        >
          <Space direction="vertical" className="w-full" size="middle">
            {question.options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={getOptionClassName(option)}>
                  <Radio
                    value={option.id}
                    disabled={isOptionDisabled(option.id)}
                    className="w-full"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg flex items-center gap-2">
                        {showExplanation && correctOptionId === option.id && (
                          <CheckCircleOutlined className="text-green-600" />
                        )}
                        {showExplanation && selectedOption === option.id && correctOptionId !== option.id && (
                          <CloseCircleOutlined className="text-red-600" />
                        )}
                        {option.text}
                      </span>
                      
                      {/* Option Image */}
                      {option.imageUrl && (
                        <img
                          src={option.imageUrl}
                          alt={option.text}
                          className="max-h-16 rounded shadow-sm"
                        />
                      )}
                      
                      {/* Option Audio */}
                      {option.audioUrl && (
                        <audio
                          src={option.audioUrl}
                          controls
                          className="h-8"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </div>
                  </Radio>
                  {option.id === shieldedOptionId && (
                    <span className="ml-4 text-xs bg-yellow-500 text-white px-2 py-1 rounded flex items-center gap-1 inline-flex">
                      <SafetyOutlined /> {t('question.shielded')}
                    </span>
                  )}
                  {eliminatedOptions.includes(option.id) && (
                    <span className="ml-4 text-xs bg-gray-500 text-white px-2 py-1 rounded flex items-center gap-1 inline-flex">
                      <DeleteOutlined /> {t('question.eliminated')}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </Space>
        </Radio.Group>

        {/* Explanation */}
        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <Alert
                message={t('question.explanation')}
                description={
                  <div>
                    <p>{question.explanation}</p>
                    
                    {/* Explanation Media */}
                    {question.explanationMedia && (
                      <div className="mt-3 flex justify-center">
                        {question.explanationMedia.type === 'image' && (
                          <img
                            src={question.explanationMedia.url}
                            alt="Explanation image"
                            className="max-w-full max-h-64 rounded-lg shadow-md"
                          />
                        )}
                        {question.explanationMedia.type === 'audio' && (
                          <audio
                            src={question.explanationMedia.url}
                            controls
                            autoPlay={question.explanationMedia.autoplay}
                            className="w-full max-w-md"
                          />
                        )}
                      </div>
                    )}
                  </div>
                }
                type="info"
                showIcon
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {!showExplanation && (
          <div className="flex justify-center gap-4 mt-6">
            <Button
              type="primary"
              size="large"
              onClick={handleConfirm}
              disabled={!selectedOption || selectedOption === shieldedOptionId}
            >
              {t('question.confirmAnswer')}
            </Button>
          </div>
        )}

        {showExplanation && (
          <div className="flex justify-center gap-4 mt-6">
            <Button type="primary" size="large" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QuestionCard;
