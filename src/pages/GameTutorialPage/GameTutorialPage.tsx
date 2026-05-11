import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Steps, Button, Typography, Space, Divider, Tag, Row, Col } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  SafetyOutlined,
  SwapOutlined,
  ScissorOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph, Text } = Typography;

const GameTutorialPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('tutorial.steps.introduction.title'),
      icon: <TrophyOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.introduction.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.introduction.description')}
          </Paragraph>
          <Card className="bg-blue-50">
            <Title level={4}>{t('tutorial.steps.introduction.objective.title')}</Title>
            <Paragraph>{t('tutorial.steps.introduction.objective.description')}</Paragraph>
          </Card>
        </Space>
      ),
    },
    {
      title: t('tutorial.steps.setup.title'),
      icon: <TeamOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.setup.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.setup.description')}
          </Paragraph>
          <Card>
            <Title level={4}>{t('tutorial.steps.setup.steps.title')}</Title>
            <ol className="list-decimal list-inside space-y-2">
              <li>{t('tutorial.steps.setup.steps.step1')}</li>
              <li>{t('tutorial.steps.setup.steps.step2')}</li>
              <li>{t('tutorial.steps.setup.steps.step3')}</li>
              <li>{t('tutorial.steps.setup.steps.step4')}</li>
            </ol>
          </Card>
          <Card className="bg-yellow-50">
            <Text strong>{t('tutorial.note')}: </Text>
            <Text>{t('tutorial.steps.setup.note')}</Text>
          </Card>
        </Space>
      ),
    },
    {
      title: t('tutorial.steps.gameBoard.title'),
      icon: <QuestionCircleOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.gameBoard.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.gameBoard.description')}
          </Paragraph>
          <Card>
            <Title level={4}>{t('tutorial.steps.gameBoard.categories.title')}</Title>
            <Paragraph>{t('tutorial.steps.gameBoard.categories.description')}</Paragraph>
            <Row gutter={[8, 8]} className="mt-4">
              {[100, 200, 300, 400, 500].map((points) => (
                <Col key={points}>
                  <Tag color="blue" className="text-lg px-4 py-2">
                    {points}
                  </Tag>
                </Col>
              ))}
            </Row>
          </Card>
          <Card>
            <Title level={4}>{t('tutorial.steps.gameBoard.howToPlay.title')}</Title>
            <ol className="list-decimal list-inside space-y-2">
              <li>{t('tutorial.steps.gameBoard.howToPlay.step1')}</li>
              <li>{t('tutorial.steps.gameBoard.howToPlay.step2')}</li>
              <li>{t('tutorial.steps.gameBoard.howToPlay.step3')}</li>
              <li>{t('tutorial.steps.gameBoard.howToPlay.step4')}</li>
            </ol>
          </Card>
        </Space>
      ),
    },
    {
      title: t('tutorial.steps.questions.title'),
      icon: <ThunderboltOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.questions.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.questions.description')}
          </Paragraph>
          <Card>
            <Title level={4}>{t('tutorial.steps.questions.answerProcess.title')}</Title>
            <ol className="list-decimal list-inside space-y-2">
              <li>{t('tutorial.steps.questions.answerProcess.step1')}</li>
              <li>{t('tutorial.steps.questions.answerProcess.step2')}</li>
              <li>{t('tutorial.steps.questions.answerProcess.step3')}</li>
              <li>{t('tutorial.steps.questions.answerProcess.step4')}</li>
            </ol>
          </Card>
          <Row gutter={16}>
            <Col span={12}>
              <Card className="bg-green-50 h-full">
                <Title level={5} className="text-green-700">
                  ✓ {t('tutorial.steps.questions.correct.title')}
                </Title>
                <Paragraph>{t('tutorial.steps.questions.correct.description')}</Paragraph>
              </Card>
            </Col>
            <Col span={12}>
              <Card className="bg-red-50 h-full">
                <Title level={5} className="text-red-700">
                  ✗ {t('tutorial.steps.questions.wrong.title')}
                </Title>
                <Paragraph>{t('tutorial.steps.questions.wrong.description')}</Paragraph>
              </Card>
            </Col>
          </Row>
        </Space>
      ),
    },
    {
      title: t('tutorial.steps.jokers.title'),
      icon: <ThunderboltOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.jokers.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.jokers.description')}
          </Paragraph>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card className="bg-purple-50">
                <Space align="start">
                  <ScissorOutlined className="text-3xl text-purple-600" />
                  <div>
                    <Title level={4} className="mt-0">
                      {t('tutorial.steps.jokers.fiftyFifty.title')}
                    </Title>
                    <Paragraph>{t('tutorial.steps.jokers.fiftyFifty.description')}</Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={24}>
              <Card className="bg-orange-50">
                <Space align="start">
                  <SwapOutlined className="text-3xl text-orange-600" />
                  <div>
                    <Title level={4} className="mt-0">
                      {t('tutorial.steps.jokers.transfer.title')}
                    </Title>
                    <Paragraph>{t('tutorial.steps.jokers.transfer.description')}</Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={24}>
              <Card className="bg-blue-50">
                <Space align="start">
                  <SafetyOutlined className="text-3xl text-blue-600" />
                  <div>
                    <Title level={4} className="mt-0">
                      {t('tutorial.steps.jokers.shield.title')}
                    </Title>
                    <Paragraph>{t('tutorial.steps.jokers.shield.description')}</Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>
          <Card className="bg-yellow-50">
            <Text strong>{t('tutorial.important')}: </Text>
            <Text>{t('tutorial.steps.jokers.limitation')}</Text>
          </Card>
        </Space>
      ),
    },
    {
      title: t('tutorial.steps.finalRound.title'),
      icon: <CrownOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.finalRound.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.finalRound.description')}
          </Paragraph>
          <Card>
            <Title level={4}>{t('tutorial.steps.finalRound.howItWorks.title')}</Title>
            <ol className="list-decimal list-inside space-y-2">
              <li>{t('tutorial.steps.finalRound.howItWorks.step1')}</li>
              <li>{t('tutorial.steps.finalRound.howItWorks.step2')}</li>
              <li>{t('tutorial.steps.finalRound.howItWorks.step3')}</li>
              <li>{t('tutorial.steps.finalRound.howItWorks.step4')}</li>
            </ol>
          </Card>
          <Card className="bg-green-50">
            <Title level={4}>{t('tutorial.steps.finalRound.scoring.title')}</Title>
            <Paragraph>{t('tutorial.steps.finalRound.scoring.description')}</Paragraph>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('tutorial.steps.finalRound.scoring.first')}</li>
              <li>{t('tutorial.steps.finalRound.scoring.second')}</li>
              <li>{t('tutorial.steps.finalRound.scoring.third')}</li>
              <li>{t('tutorial.steps.finalRound.scoring.fourth')}</li>
            </ul>
          </Card>
        </Space>
      ),
    },
    {
      title: t('tutorial.steps.winning.title'),
      icon: <TrophyOutlined />,
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <Title level={3}>{t('tutorial.steps.winning.title')}</Title>
          <Paragraph className="text-lg">
            {t('tutorial.steps.winning.description')}
          </Paragraph>
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <Title level={4}>{t('tutorial.steps.winning.tips.title')}</Title>
            <ul className="list-disc list-inside space-y-2">
              <li>{t('tutorial.steps.winning.tips.tip1')}</li>
              <li>{t('tutorial.steps.winning.tips.tip2')}</li>
              <li>{t('tutorial.steps.winning.tips.tip3')}</li>
              <li>{t('tutorial.steps.winning.tips.tip4')}</li>
              <li>{t('tutorial.steps.winning.tips.tip5')}</li>
            </ul>
          </Card>
          <Divider />
          <div className="text-center">
            <Title level={3}>{t('tutorial.steps.winning.ready')}</Title>
            <Paragraph className="text-lg">{t('tutorial.steps.winning.goodLuck')}</Paragraph>
          </div>
        </Space>
      ),
    },
  ];

  const handleNext = () => {
    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl mb-6">
            <div className="flex items-center justify-between mb-6">
              <Title level={2} className="mb-0">
                <QuestionCircleOutlined className="mr-2" />
                {t('tutorial.title')}
              </Title>
              <Button
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
              >
                {t('tutorial.backToHome')}
              </Button>
            </div>

            <Steps
              current={currentStep}
              onChange={setCurrentStep}
              items={steps.map((step) => ({
                title: step.title,
                icon: step.icon,
              }))}
              className="mb-8"
            />

            <Divider />

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="min-h-[400px]"
            >
              {steps[currentStep].content}
            </motion.div>

            <Divider />

            <div className="flex justify-between items-center">
              <Button
                size="large"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                {t('common.back')}
              </Button>
              <Text>
                {currentStep + 1} / {steps.length}
              </Text>
              {currentStep < steps.length - 1 ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={handleNext}
                >
                  {t('common.next')}
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  icon={<TrophyOutlined />}
                  onClick={() => navigate('/')}
                >
                  {t('tutorial.startPlaying')}
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default GameTutorialPage;
