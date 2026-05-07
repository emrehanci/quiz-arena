import React from 'react';
import { Drawer, Button, Select, InputNumber, Space, Divider, Typography } from 'antd';
import {
  PauseOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Team } from '../../types';

const { Title, Text } = Typography;

interface AdminPanelProps {
  visible: boolean;
  onClose: () => void;
  teams: Team[];
  currentTeamIndex: number;
  onChangeTeam: (index: number) => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onResetTimer: () => void;
  onUpdateScore: (teamId: string, score: number) => void;
  onMarkAsAnswered: () => void;
  onMarkAsLost: () => void;
  onCancelQuestion: () => void;
  onStartFinalRound: () => void;
  onSkipFinalRound: () => void;
  onEndGame: () => void;
  hasActiveQuestion: boolean;
  timerPaused: boolean;
  canStartFinalRound: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  visible,
  onClose,
  teams,
  currentTeamIndex,
  onChangeTeam,
  onPauseTimer,
  onResumeTimer,
  onResetTimer,
  onUpdateScore,
  onMarkAsAnswered,
  onMarkAsLost,
  onCancelQuestion,
  onStartFinalRound,
  onSkipFinalRound,
  onEndGame,
  hasActiveQuestion,
  timerPaused,
  canStartFinalRound,
}) => {
  const { t } = useTranslation();
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>('');
  const [newScore, setNewScore] = React.useState<number>(0);

  const handleScoreUpdate = () => {
    if (selectedTeamId) {
      onUpdateScore(selectedTeamId, newScore);
    }
  };

  return (
    <Drawer
      title={t('admin.title')}
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      zIndex={10000}
    >
      <Space direction="vertical" className="w-full" size="large">
        {/* Turn Control */}
        <div>
          <Title level={5}>{t('admin.turnControl')}</Title>
          <Text type="secondary">{t('admin.currentTurn')}:</Text>
          <div className="mt-2">
            <Select
              className="w-full"
              value={currentTeamIndex}
              onChange={onChangeTeam}
              options={teams.map((team, index) => ({
                label: team.name,
                value: index,
              }))}
            />
          </div>
        </div>

        <Divider />

        {/* Timer Control */}
        <div>
          <Title level={5}>{t('admin.timerControl')}</Title>
          <Space>
            <Button
              icon={timerPaused ? <PlayCircleOutlined /> : <PauseOutlined />}
              onClick={timerPaused ? onResumeTimer : onPauseTimer}
              disabled={!hasActiveQuestion}
            >
              {timerPaused ? t('admin.resume') : t('admin.pause')}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={onResetTimer}
              disabled={!hasActiveQuestion}
            >
              {t('admin.reset')}
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Score Control */}
        <div>
          <Title level={5}>{t('admin.scoreControl')}</Title>
          <Space direction="vertical" className="w-full">
            <Select
              className="w-full"
              placeholder={t('teamSetup.teamName')}
              value={selectedTeamId || undefined}
              onChange={(value) => {
                setSelectedTeamId(value);
                const team = teams.find(t => t.id === value);
                if (team) setNewScore(team.score);
              }}
              options={teams.map((team) => ({
                label: `${team.name} (${team.score})`,
                value: team.id,
              }))}
            />
            <InputNumber
              className="w-full"
              value={newScore}
              onChange={(value) => setNewScore(value || 0)}
              min={0}
              step={100}
            />
            <Button
              type="primary"
              onClick={handleScoreUpdate}
              disabled={!selectedTeamId}
            >
              {t('admin.updateScore')}
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Question Control */}
        <div>
          <Title level={5}>{t('admin.questionControl')}</Title>
          <Space direction="vertical" className="w-full">
            <Button
              icon={<CheckCircleOutlined />}
              onClick={onMarkAsAnswered}
              disabled={!hasActiveQuestion}
              block
            >
              {t('admin.markAsAnswered')}
            </Button>
            <Button
              icon={<CloseCircleOutlined />}
              onClick={onMarkAsLost}
              disabled={!hasActiveQuestion}
              block
              danger
            >
              {t('admin.markAsLost')}
            </Button>
            <Button
              onClick={onCancelQuestion}
              disabled={!hasActiveQuestion}
              block
            >
              {t('admin.cancelQuestion')}
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Final Round Control */}
        <div>
          <Title level={5}>{t('admin.finalRoundControl')}</Title>
          <Space direction="vertical" className="w-full">
            <Button
              type="primary"
              onClick={onStartFinalRound}
              disabled={!canStartFinalRound}
              block
            >
              {t('admin.startFinalRound')}
            </Button>
            <Button
              onClick={onSkipFinalRound}
              disabled={!canStartFinalRound}
              block
            >
              {t('admin.skipFinalRound')}
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Game Control */}
        <div>
          <Title level={5}>Game Control</Title>
          <Button
            danger
            type="primary"
            onClick={onEndGame}
            block
          >
            End Game
          </Button>
        </div>
      </Space>
    </Drawer>
  );
};

export default AdminPanel;
