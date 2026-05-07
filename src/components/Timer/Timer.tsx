import React from 'react';
import { Progress } from 'antd';
import { ClockCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { formatTime } from '../../utils/helpers';
import { useQuestionTimer } from '../../hooks/useQuestionTimer';
import { QUESTION_DURATION } from '../../constants';

interface TimerProps {
  size?: number;
}

const Timer: React.FC<TimerProps> = ({ size = 120 }) => {
  const { timeRemaining, isPaused } = useQuestionTimer();
  
  const percentage = (timeRemaining / QUESTION_DURATION) * 100;
  const formattedTime = formatTime(timeRemaining);
  
  // Color based on remaining time
  const getColor = () => {
    if (percentage > 60) return '#52c41a'; // green
    if (percentage > 30) return '#faad14'; // orange
    return '#f5222d'; // red
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex flex-col items-center justify-center"
    >
      <Progress
        type="circle"
        percent={percentage}
        format={() => formattedTime}
        size={size}
        strokeColor={getColor()}
        status={isPaused ? 'exception' : 'normal'}
      />
      {isPaused && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-orange-500 font-semibold flex items-center gap-1"
        >
          <PauseCircleOutlined /> PAUSED
        </motion.div>
      )}
    </motion.div>
  );
};

export default Timer;
