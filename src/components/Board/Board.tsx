import React from 'react';
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

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Category Headers */}
        <div className="grid grid-cols-10 gap-3 mb-4 items-stretch">
          {set.categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-center flex"
            >
              <div className="relative group flex-1">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-2 border border-slate-600/50 backdrop-blur-sm h-full flex items-center justify-center">
                  <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider text-center leading-tight">
                    {category.title}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Point Rows */}
        {POINT_VALUES.map((point, rowIndex) => (
          <div key={point} className={`grid grid-cols-10 gap-3 ${rowIndex < POINT_VALUES.length - 1 ? 'mb-3' : ''}`}>
            {set.categories.map((category, colIndex) => {
              const status = getCellStatus(category.id, point);
              const isDisabled = isCellDisabled(category.id, point) || disabled;

              return (
                <motion.div
                  key={`${category.id}-${point}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIndex * 10 + colIndex) * 0.01 }}
                  className="relative group"
                >
                  <div 
                    className={`
                      absolute inset-0 rounded-xl blur transition-all duration-300
                      ${!isDisabled && status === 'available' ? 'bg-gradient-to-r from-blue-500 to-purple-500 opacity-40 group-hover:opacity-70' : 'opacity-0'}
                    `}
                  ></div>
                  <button
                    className={`
                      relative w-full h-14 rounded-xl font-bold text-xl
                      transition-all duration-300 transform
                      border-2
                      ${
                        isDisabled 
                          ? 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-400 cursor-not-allowed border-slate-600/50' 
                          : status === 'answered'
                          ? 'bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-emerald-500/50 cursor-not-allowed opacity-60'
                          : status === 'lost'
                          ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500/50 cursor-not-allowed opacity-60'
                          : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white border-blue-400/50 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50 active:scale-95'
                      }
                    `}
                    disabled={isDisabled}
                    onClick={() => onSelectQuestion(category.id, point)}
                  >
                    <span className="relative z-10 drop-shadow-lg">{point}</span>
                  </button>
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
