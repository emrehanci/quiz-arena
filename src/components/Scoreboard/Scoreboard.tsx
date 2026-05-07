import React from 'react';
import { Card, Table } from 'antd';
import { TrophyOutlined, FireOutlined, StarOutlined, CrownOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Team } from '../../types';

interface ScoreboardProps {
  teams: Team[];
  currentTeamId?: string;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ teams, currentTeamId }) => {
  const { t } = useTranslation();

  // Sort teams by score (descending)
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const columns = [
    {
      title: t('gameBoard.scoreboard'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Team) => (
        <div className="flex items-center gap-2">
          {record.id === sortedTeams[0]?.id && record.score > 0 && (
            <CrownOutlined className="text-yellow-500 text-xl" />
          )}
          {record.consecutiveCorrectCount > 0 && (
            <FireOutlined className="text-orange-500 text-lg" />
          )}
          <span
            className={`font-semibold ${
              record.id === currentTeamId ? 'text-blue-600' : ''
            }`}
          >
            {name}
          </span>
          {record.id === currentTeamId && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1">
              <StarOutlined /> {t('gameBoard.currentTurn')}
            </span>
          )}
        </div>
      ),
    },
    {
      title: t('results.score'),
      dataIndex: 'score',
      key: 'score',
      align: 'right' as const,
      render: (score: number) => (
        <span className="text-lg font-bold text-green-600">{score}</span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-lg">
        <Table
          dataSource={sortedTeams}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
          rowClassName={(record) =>
            record.id === currentTeamId ? 'bg-blue-50' : ''
          }
        />
      </Card>
    </motion.div>
  );
};

export default Scoreboard;
