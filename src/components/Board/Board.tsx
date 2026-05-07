import React from 'react';
import { Button, Card } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import type { QuizSet, AnsweredQuestion } from '../../types';
import { POINT_VALUES } from '../../constants';
import { GameLogicService } from '../../services/gameLogic';

interface BoardProps {
  set: QuizSet;
  answeredQuestions: AnsweredQuestion[];
  lostQuestions: AnsweredQuestion[];
  onSelectQuestion: (categoryId: string, point: number) => void;
  disabled?: boolean;
}

const Board: React.FC<BoardProps> = ({
  set,
  answeredQuestions,
  lostQuestions,
  onSelectQuestion,
  disabled = false,
}) => {
  const isCellDisabled = (categoryId: string, point: number) => {
    return !GameLogicService.isCellAvailable(
      categoryId,
      point,
      answeredQuestions,
      lostQuestions
    );
  };

  const getCellStatus = (categoryId: string, point: number) => {
    const isAnswered = answeredQuestions.some(
      q => q.categoryId === categoryId && q.point === point
    );
    const isLost = lostQuestions.some(
      q => q.categoryId === categoryId && q.point === point
    );

    if (isAnswered) return 'answered';
    if (isLost) return 'lost';
    return 'available';
  };

  const getCellColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white cursor-not-allowed opacity-50';
      case 'lost':
        return 'bg-red-500 text-white cursor-not-allowed opacity-50';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer';
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
      <div className="min-w-[800px]">
        {/* Category Headers */}
        <div className="grid grid-cols-10 gap-2 mb-2">
          {set.categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-center"
            >
              <Card
                className="bg-gradient-to-b from-purple-600 to-purple-800 border-none"
                bodyStyle={{ padding: '12px' }}
              >
                <h3 className="font-bold text-sm md:text-base line-clamp-2 min-h-[48px] flex items-center justify-center gap-2">
                  <BookOutlined className="text-yellow-300" />
                  {category.title}
                </h3>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Point Rows */}
        {POINT_VALUES.map((point, rowIndex) => (
          <div key={point} className={`grid grid-cols-10 gap-2 ${rowIndex < POINT_VALUES.length - 1 ? 'mb-2' : ''}`}>
            {set.categories.map((category, colIndex) => {
              const status = getCellStatus(category.id, point);
              const isDisabled = isCellDisabled(category.id, point) || disabled;

              return (
                <motion.div
                  key={`${category.id}-${point}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIndex * 10 + colIndex) * 0.01 }}
                >
                  <Button
                    size="large"
                    className={`w-full h-16 text-2xl font-bold ${
                      isDisabled 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : getCellColor(status)
                    }`}
                    disabled={isDisabled}
                    onClick={() => onSelectQuestion(category.id, point)}
                  >
                    {point}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
