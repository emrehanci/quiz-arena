import React, { useState } from 'react';
import { Card, Button, Modal, Select, Space, Alert } from 'antd';
import { ScissorOutlined, SwapOutlined, SafetyOutlined, ThunderboltOutlined, WarningOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { Team, Option } from '../../types';
import { soundService } from '../../utils/soundService';

interface JokerPanelProps {
  currentTeam: Team;
  otherTeams: Team[];
  options: Option[];
  eliminatedOptions: string[];
  onUseFiftyFifty: () => void;
  onUseTransfer: (toTeamId: string) => void;
  onUseShield: (optionId: string) => void;
  disabled?: boolean;
  isTransferred?: boolean;
  hasFiftyFiftyBeenUsed?: boolean;
}

const JokerPanel: React.FC<JokerPanelProps> = ({
  currentTeam,
  otherTeams,
  options,
  eliminatedOptions,
  onUseFiftyFifty,
  onUseTransfer,
  onUseShield,
  disabled = false,
  isTransferred = false,
  hasFiftyFiftyBeenUsed = false,
}) => {
  const { t } = useTranslation();
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [shieldModalVisible, setShieldModalVisible] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');

  const handleFiftyFifty = () => {
    Modal.confirm({
      title: t('jokers.fiftyFifty'),
      content: t('jokers.fiftyFiftyDescription'),
      onOk: () => {
        soundService.playJoker();
        onUseFiftyFifty();
      },
    });
  };

  const handleTransfer = () => {
    setTransferModalVisible(true);
  };

  const handleTransferConfirm = () => {
    if (selectedTeamId) {
      soundService.playJoker();
      onUseTransfer(selectedTeamId);
      setTransferModalVisible(false);
      setSelectedTeamId('');
    }
  };

  const handleShield = () => {
    setShieldModalVisible(true);
  };

  const handleShieldConfirm = () => {
    if (selectedOptionId) {
      soundService.playJoker();
      onUseShield(selectedOptionId);
      setShieldModalVisible(false);
      setSelectedOptionId('');
    }
  };

  const availableOptions = options.filter(
    opt => !eliminatedOptions.includes(opt.id)
  );

  // Check if there are exactly 4 options available
  const hasFourOptions = availableOptions.length === 4;
  
  // Check if team has already used their 1 joker this turn
  const hasUsedJokerThisTurn = currentTeam.jokersUsedThisTurn >= 1;

  return (
    <>
      <Card title={<span><ThunderboltOutlined className="text-yellow-500" /> {t('jokers.title')}</span>} className="mb-4">
        <Space direction="vertical" className="w-full">
          {/* Fifty-Fifty */}
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">
                <ScissorOutlined className="text-purple-500 mr-2" />
                {t('jokers.fiftyFifty')}
              </div>
              <div className="text-xs text-gray-500">
                {t('jokers.fiftyFiftyDescription')}
              </div>
            </div>
            <Button
              onClick={handleFiftyFifty}
              disabled={
                disabled ||
                currentTeam.jokers.fiftyFiftyUsed ||
                isTransferred ||
                !hasFourOptions ||
                hasUsedJokerThisTurn
              }
              type={currentTeam.jokers.fiftyFiftyUsed ? 'default' : 'primary'}
            >
              {currentTeam.jokers.fiftyFiftyUsed
                ? t('jokers.used')
                : t('jokers.use')}
            </Button>
          </div>

          {/* Transfer */}
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">
                <SwapOutlined className="text-blue-500 mr-2" />
                {t('jokers.transfer')}
              </div>
              <div className="text-xs text-gray-500">
                {t('jokers.transferDescription')}
              </div>
            </div>
            <Button
              onClick={handleTransfer}
              disabled={
                disabled ||
                currentTeam.jokers.transferUsed ||
                isTransferred ||
                otherTeams.length === 0 ||
                !hasFourOptions ||
                hasUsedJokerThisTurn
              }
              type={currentTeam.jokers.transferUsed ? 'default' : 'primary'}
            >
              {currentTeam.jokers.transferUsed
                ? t('jokers.used')
                : t('jokers.use')}
            </Button>
          </div>

          {/* Shield */}
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold">
                <SafetyOutlined className="text-green-500 mr-2" />
                {t('jokers.shield')}
              </div>
              <div className="text-xs text-gray-500">
                {t('jokers.shieldDescription')}
              </div>
            </div>
            <Button
              onClick={handleShield}
              disabled={
                disabled ||
                currentTeam.jokers.shieldUsed ||
                isTransferred ||
                availableOptions.length < 2 ||
                hasUsedJokerThisTurn
              }
              type={currentTeam.jokers.shieldUsed ? 'default' : 'primary'}
            >
              {currentTeam.jokers.shieldUsed
                ? t('jokers.used')
                : t('jokers.use')}
            </Button>
          </div>
        </Space>

        {hasUsedJokerThisTurn && !isTransferred && (
          <Alert
            message={t('jokers.maxJokerPerTurn')}
            type="info"
            className="mt-4"
            showIcon
          />
        )}

        {isTransferred && (
          <Alert
            message={t('jokers.cannotUseOnTransferred')}
            type="warning"
            className="mt-4"
            showIcon
          />
        )}

        {!hasFourOptions && !isTransferred && !hasUsedJokerThisTurn && (
          <Alert
            message={t('jokers.cannotUseAfterFiftyFifty')}
            type="info"
            className="mt-4"
            showIcon
          />
        )}
      </Card>

      {/* Transfer Modal */}
      <Modal
        title={t('jokers.transfer')}
        open={transferModalVisible}
        onOk={handleTransferConfirm}
        onCancel={() => setTransferModalVisible(false)}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <div className="py-4">
          <div className="mb-4">{t('jokers.selectTeam')}</div>
          <Select
            className="w-full"
            value={selectedTeamId || undefined}
            onChange={setSelectedTeamId}
            options={otherTeams.map(team => ({
              label: team.name,
              value: team.id,
            }))}
            placeholder={t('jokers.selectTeam')}
          />
        </div>
      </Modal>

      {/* Shield Modal */}
      <Modal
        title={t('jokers.shield')}
        open={shieldModalVisible}
        onOk={handleShieldConfirm}
        onCancel={() => setShieldModalVisible(false)}
        okText={t('common.confirm')}
        cancelText={t('common.cancel')}
      >
        <div className="py-4">
          <div className="mb-4">{t('jokers.selectShield')}</div>
          <Select
            className="w-full"
            value={selectedOptionId || undefined}
            onChange={setSelectedOptionId}
            options={availableOptions.map(opt => ({
              label: opt.text,
              value: opt.id,
            }))}
            placeholder={t('jokers.selectShield')}
          />
        </div>
      </Modal>
    </>
  );
};

export default JokerPanel;
