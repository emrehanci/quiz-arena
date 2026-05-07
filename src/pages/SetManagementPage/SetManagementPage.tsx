import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Table, Typography, Space, message, Modal, Upload } from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  UploadOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { addSet, deleteSet, importSet, updateSet } from '../../store/settingsSlice';
import { SetService } from '../../services/setService';
import { hasValidationErrors, formatValidationErrors } from '../../utils/validation';
import SetEditor from '../../components/SetEditor/SetEditor';
import type { QuizSet } from '../../types';

const { Title } = Typography;
const { confirm } = Modal;

const SetManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const sets = useAppSelector(state => state.settings.sets);
  
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingSet, setEditingSet] = useState<QuizSet | null>(null);

  const handleBack = () => {
    navigate('/');
  };

  const handleCreateSet = () => {
    setEditingSet(null);
    setEditorVisible(true);
  };

  const handleEditSet = (set: QuizSet) => {
    setEditingSet(set);
    setEditorVisible(true);
  };

  const handleSaveSet = (set: QuizSet) => {
    if (editingSet) {
      // Update existing set
      dispatch(updateSet(set));
      message.success('Set updated successfully');
    } else {
      // Add new set
      dispatch(addSet(set));
      message.success('Set created successfully');
    }
    setEditorVisible(false);
    setEditingSet(null);
  };

  const handleExportSet = (setId: string) => {
    const set = sets.find(s => s.id === setId);
    if (set) {
      SetService.exportSet(set);
      message.success(t('setManagement.exportSuccess'));
    }
  };

  const handleImportSet = async (file: File) => {
    try {
      const result = await SetService.importSet(file);
      
      if (result.errors.length > 0) {
        Modal.error({
          title: t('setManagement.validationError'),
          content: formatValidationErrors(result.errors),
          width: 600,
        });
        return false;
      }

      if (result.set) {
        dispatch(importSet(result.set));
        message.success(t('setManagement.importSuccess'));
      }
      
      return false; // Prevent upload
    } catch (error) {
      message.error(t('setManagement.importError'));
      return false;
    }
  };

  const handleDeleteSet = (setId: string) => {
    const set = sets.find(s => s.id === setId);
    
    confirm({
      title: t('setManagement.deleteConfirm'),
      content: set?.name,
      okText: t('common.yes'),
      okType: 'danger',
      cancelText: t('common.no'),
      onOk() {
        dispatch(deleteSet(setId));
        message.success('Set deleted');
      },
    });
  };

  const columns = [
    {
      title: t('setManagement.setName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: t('setManagement.setDescription'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: t('setManagement.categories'),
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: any[]) => categories.length,
    },
    {
      title: t('setManagement.finalRoundEnabled'),
      dataIndex: 'finalRoundEnabled',
      key: 'finalRoundEnabled',
      render: (enabled: boolean) => (enabled ? t('common.yes') : t('common.no')),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditSet(record)}
          >
            Edit
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExportSet(record.id)}
          >
            {t('setManagement.exportSet')}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSet(record.id)}
            disabled={sets.length === 1} // Prevent deleting last set
          >
            {t('common.delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden p-4 md:p-8">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      <div className="relative z-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-2xl">
            <div className="mb-6">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="mb-4"
              >
                {t('common.back')}
              </Button>
              <Title level={2} className="mb-0">
                {t('setManagement.title')}
              </Title>
            </div>

            {/* Action Buttons */}
            <div className="mb-6">
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateSet}
                  size="large"
                >
                  {t('setManagement.createSet')}
                </Button>
                <Upload
                  accept=".json"
                  showUploadList={false}
                  beforeUpload={handleImportSet}
                >
                  <Button icon={<UploadOutlined />} size="large">
                    {t('setManagement.importSet')}
                  </Button>
                </Upload>
              </Space>
            </div>

            {/* Sets Table */}
            <Table
              dataSource={sets}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />

            {/* Info */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> You can create, edit, export and import quiz sets. 
                Export sets as JSON files to share them with others.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
      </div>

      {/* Set Editor Modal */}
      <SetEditor
        visible={editorVisible}
        onClose={() => {
          setEditorVisible(false);
          setEditingSet(null);
        }}
        onSave={handleSaveSet}
        initialSet={editingSet}
      />
    </div>
  );
};

export default SetManagementPage;
