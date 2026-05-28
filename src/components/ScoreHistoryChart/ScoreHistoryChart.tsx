import React from 'react';
import { Card, Typography } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { GameLogEntry, Team } from '../../types';

const { Title } = Typography;

interface ScoreHistoryChartProps {
  gameLog: GameLogEntry[];
  teams: Team[];
}

const ScoreHistoryChart: React.FC<ScoreHistoryChartProps> = ({ gameLog, teams }) => {
  const { t } = useTranslation();

  // Transform game log into chart data
  const chartData = gameLog.map((entry, index) => {
    const dataPoint: any = {
      name: `Q${index + 1}`,
      questionText: entry.questionText.substring(0, 30) + '...',
    };
    
    // Add each team's score at this point
    Object.entries(entry.teamScoresSnapshot).forEach(([teamId, score]) => {
      const team = teams.find(t => t.id === teamId);
      if (team) {
        dataPoint[team.name] = score;
      }
    });
    
    return dataPoint;
  });

  // Add initial state (all teams at 0)
  if (chartData.length > 0) {
    const initialPoint: any = { name: 'Start' };
    teams.forEach(team => {
      initialPoint[team.name] = 0;
    });
    chartData.unshift(initialPoint);
  }

  // Generate colors for each team
  const colors = [
    '#1890ff', // blue
    '#52c41a', // green
    '#faad14', // gold
    '#f5222d', // red
    '#722ed1', // purple
    '#13c2c2', // cyan
    '#eb2f96', // magenta
    '#fa8c16', // orange
  ];

  if (gameLog.length === 0) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">
          {t('results.noGameHistory')}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Title level={3} className="mb-4">
        {t('results.scoreHistory')}
      </Title>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold mb-2">{payload[0]?.payload?.questionText || ''}</p>
                    {payload.map((entry: any, index: number) => (
                      <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value} {t('question.points')}
                      </p>
                    ))}
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          {teams.map((team, index) => (
            <Line
              key={team.id}
              type="monotone"
              dataKey={team.name}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ScoreHistoryChart;
