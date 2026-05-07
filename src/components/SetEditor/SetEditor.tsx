import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Tabs,
  Space,
  Card,
  InputNumber,
  Select,
  Switch,
  message,
  Collapse,
  List,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { QuizSet, Category, Question, FinalRoundQuestion } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface SetEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (set: QuizSet) => void;
  initialSet?: QuizSet | null;
}

const SetEditor: React.FC<SetEditorProps> = ({
  visible,
  onClose,
  onSave,
  initialSet,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  
  const [set, setSet] = useState<QuizSet>(
    initialSet || {
      id: uuidv4(),
      name: '',
      description: '',
      finalRoundEnabled: false,
      categories: [],
      finalRoundQuestions: [],
    }
  );

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{
    categoryId: string;
    point: number;
    question: Question | null;
  } | null>(null);

  // Update set state when initialSet changes or modal opens
  useEffect(() => {
    if (visible) {
      if (initialSet) {
        setSet(initialSet);
      } else {
        setSet({
          id: uuidv4(),
          name: '',
          description: '',
          finalRoundEnabled: false,
          categories: [],
          finalRoundQuestions: [],
        });
      }
    }
  }, [visible, initialSet]);

  const handleSave = () => {
    if (!set.name.trim()) {
      message.error('Set name is required');
      return;
    }
    if (set.categories.length === 0) {
      message.error('At least one category is required');
      return;
    }
    onSave(set);
    onClose();
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: uuidv4(),
      title: 'New Category',
      questionsByPoint: {
        100: [],
        200: [],
        300: [],
        400: [],
        500: [],
      },
    };
    setSet({ ...set, categories: [...set.categories, newCategory] });
  };

  const handleUpdateCategory = (categoryId: string, title: string) => {
    setSet({
      ...set,
      categories: set.categories.map(cat =>
        cat.id === categoryId ? { ...cat, title } : cat
      ),
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    setSet({
      ...set,
      categories: set.categories.filter(cat => cat.id !== categoryId),
    });
  };

  const handleAddQuestion = (categoryId: string, point: 100 | 200 | 300 | 400 | 500) => {
    setEditingQuestion({
      categoryId,
      point,
      question: null,
    });
  };

  const handleSaveQuestion = (
    categoryId: string,
    point: 100 | 200 | 300 | 400 | 500,
    question: Question
  ) => {
    setSet({
      ...set,
      categories: set.categories.map(cat => {
        if (cat.id === categoryId) {
          const questions = [...cat.questionsByPoint[point]];
          const existingIndex = questions.findIndex(q => q.id === question.id);
          if (existingIndex >= 0) {
            questions[existingIndex] = question;
          } else {
            questions.push(question);
          }
          return {
            ...cat,
            questionsByPoint: {
              ...cat.questionsByPoint,
              [point]: questions,
            },
          };
        }
        return cat;
      }),
    });
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (
    categoryId: string,
    point: 100 | 200 | 300 | 400 | 500,
    questionId: string
  ) => {
    setSet({
      ...set,
      categories: set.categories.map(cat => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            questionsByPoint: {
              ...cat.questionsByPoint,
              [point]: cat.questionsByPoint[point].filter(q => q.id !== questionId),
            },
          };
        }
        return cat;
      }),
    });
  };

  const handleAddFinalRoundQuestion = () => {
    const newQuestion: FinalRoundQuestion = {
      id: uuidv4(),
      questionText: 'New Final Round Question',
      correctAnswer: 0,
      explanation: '',
    };
    setSet({
      ...set,
      finalRoundQuestions: [...set.finalRoundQuestions, newQuestion],
    });
  };

  return (
    <Modal
      open={visible}
      title={
        <span className="text-xl font-bold">
          <EditOutlined /> {initialSet ? 'Edit Quiz Set' : 'Create Quiz Set'}
        </span>
      }
      onCancel={onClose}
      width={1200}
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          Save Set
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Basic Info */}
        <Card title="Basic Information">
          <Form layout="vertical">
            <Form.Item label="Set Name" required>
              <Input
                value={set.name}
                onChange={e => setSet({ ...set, name: e.target.value })}
                placeholder="Enter set name"
              />
            </Form.Item>
            <Form.Item label="Description">
              <TextArea
                value={set.description}
                onChange={e => setSet({ ...set, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </Form.Item>
            <Form.Item label="Enable Final Round">
              <Switch
                checked={set.finalRoundEnabled}
                onChange={checked => setSet({ ...set, finalRoundEnabled: checked })}
              />
            </Form.Item>
          </Form>
        </Card>

        {/* Categories */}
        <Card
          title="Categories"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddCategory}
              disabled={set.categories.length >= 10}
            >
              Add Category
            </Button>
          }
        >
          <Collapse>
            {set.categories.map((category, index) => (
              <Panel
                key={category.id}
                header={
                  <div className="flex items-center justify-between w-full pr-4">
                    <Input
                      value={category.title}
                      onChange={e => {
                        e.stopPropagation();
                        handleUpdateCategory(category.id, e.target.value);
                      }}
                      onClick={e => e.stopPropagation()}
                      className="w-64"
                    />
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                }
              >
                <div className="space-y-4">
                  {[100, 200, 300, 400, 500].map(point => (
                    <Card
                      key={point}
                      size="small"
                      title={`${point} Points`}
                      extra={
                        <Button
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            handleAddQuestion(category.id, point as 100 | 200 | 300 | 400 | 500)
                          }
                        >
                          Add Question
                        </Button>
                      }
                    >
                      <List
                        dataSource={category.questionsByPoint[point as 100 | 200 | 300 | 400 | 500]}
                        renderItem={question => (
                          <List.Item
                            actions={[
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() =>
                                  setEditingQuestion({
                                    categoryId: category.id,
                                    point: point as 100 | 200 | 300 | 400 | 500,
                                    question,
                                  })
                                }
                              >
                                Edit
                              </Button>,
                              <Button
                                danger
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDeleteQuestion(
                                    category.id,
                                    point as 100 | 200 | 300 | 400 | 500,
                                    question.id
                                  )
                                }
                              >
                                Delete
                              </Button>,
                            ]}
                          >
                            <div className="text-sm">{question.questionText}</div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  ))}
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>

        {/* Final Round Questions */}
        {set.finalRoundEnabled && (
          <Card
            title="Final Round Questions"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddFinalRoundQuestion}
                disabled={set.finalRoundQuestions.length >= 5}
              >
                Add Question
              </Button>
            }
          >
            <List
              dataSource={set.finalRoundQuestions}
              renderItem={(question, index) => (
                <List.Item
                  actions={[
                    <Button
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() =>
                        setSet({
                          ...set,
                          finalRoundQuestions: set.finalRoundQuestions.filter(
                            q => q.id !== question.id
                          ),
                        })
                      }
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <div className="w-full space-y-2">
                    <Input
                      placeholder="Question text"
                      value={question.questionText}
                      onChange={e =>
                        setSet({
                          ...set,
                          finalRoundQuestions: set.finalRoundQuestions.map(q =>
                            q.id === question.id ? { ...q, questionText: e.target.value } : q
                          ),
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <InputNumber
                        placeholder="Correct answer"
                        value={question.correctAnswer}
                        onChange={value =>
                          setSet({
                            ...set,
                            finalRoundQuestions: set.finalRoundQuestions.map(q =>
                              q.id === question.id ? { ...q, correctAnswer: value || 0 } : q
                            ),
                          })
                        }
                      />
                      <Input
                        placeholder="Explanation"
                        value={question.explanation}
                        onChange={e =>
                          setSet({
                            ...set,
                            finalRoundQuestions: set.finalRoundQuestions.map(q =>
                              q.id === question.id ? { ...q, explanation: e.target.value } : q
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>

      {/* Question Editor Modal */}
      {editingQuestion && (
        <QuestionEditorModal
          visible={true}
          categoryId={editingQuestion.categoryId}
          point={editingQuestion.point}
          question={editingQuestion.question}
          onSave={handleSaveQuestion}
          onCancel={() => setEditingQuestion(null)}
        />
      )}
    </Modal>
  );
};

// Question Editor Modal Component
interface QuestionEditorModalProps {
  visible: boolean;
  categoryId: string;
  point: number;
  question: Question | null;
  onSave: (categoryId: string, point: 100 | 200 | 300 | 400 | 500, question: Question) => void;
  onCancel: () => void;
}

const QuestionEditorModal: React.FC<QuestionEditorModalProps> = ({
  visible,
  categoryId,
  point,
  question,
  onSave,
  onCancel,
}) => {
  const [questionData, setQuestionData] = useState<Question>(
    question || {
      id: uuidv4(),
      categoryId,
      point,
      questionText: '',
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correctOptionId: 'a',
      explanation: '',
    }
  );

  const handleSave = () => {
    if (!questionData.questionText.trim()) {
      message.error('Question text is required');
      return;
    }
    if (questionData.options.some(opt => !opt.text.trim())) {
      message.error('All options must have text');
      return;
    }
    onSave(categoryId, point as 100 | 200 | 300 | 400 | 500, questionData);
  };

  return (
    <Modal
      open={visible}
      title="Edit Question"
      onCancel={onCancel}
      onOk={handleSave}
      width={800}
    >
      <Form layout="vertical">
        <Form.Item label="Question Text" required>
          <TextArea
            value={questionData.questionText}
            onChange={e =>
              setQuestionData({ ...questionData, questionText: e.target.value })
            }
            rows={3}
          />
        </Form.Item>

        <Form.Item label="Options" required>
          <Space direction="vertical" className="w-full">
            {questionData.options.map((option, index) => (
              <div key={option.id} className="flex gap-2 items-center">
                <span className="font-bold">{option.id.toUpperCase()}:</span>
                <Input
                  value={option.text}
                  onChange={e =>
                    setQuestionData({
                      ...questionData,
                      options: questionData.options.map((opt, i) =>
                        i === index ? { ...opt, text: e.target.value } : opt
                      ),
                    })
                  }
                  placeholder={`Option ${option.id.toUpperCase()}`}
                />
              </div>
            ))}
          </Space>
        </Form.Item>

        <Form.Item label="Correct Answer" required>
          <Select
            value={questionData.correctOptionId}
            onChange={value => setQuestionData({ ...questionData, correctOptionId: value })}
          >
            {questionData.options.map(option => (
              <Select.Option key={option.id} value={option.id}>
                {option.id.toUpperCase()}: {option.text || '(empty)'}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Explanation">
          <TextArea
            value={questionData.explanation}
            onChange={e =>
              setQuestionData({ ...questionData, explanation: e.target.value })
            }
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SetEditor;
