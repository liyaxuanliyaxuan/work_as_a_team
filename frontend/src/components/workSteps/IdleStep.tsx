import React, { useEffect, useState } from 'react';
import { Button, Typography, Select, Space, message } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { getFilePaths, selectFilePath } from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const IdleStep: React.FC = () => {
  const [filePaths, setFilePaths] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingPaths, setLoadingPaths] = useState(true);

  // 获取文件路径列表
  useEffect(() => {
    const fetchFilePaths = async () => {
      try {
        const paths = await getFilePaths();
        setFilePaths(paths);
      } catch (error) {
        message.error('获取文件列表失败');
      } finally {
        setLoadingPaths(false);
      }
    };

    fetchFilePaths();
  }, []);

  // 处理开始按钮点击
  const handleStart = async () => {
    if (!selectedPath) {
      message.warning('请先选择文件路径');
      return;
    }

    setLoading(true);
    try {
      await selectFilePath(selectedPath);
      message.success('文件路径已发送');
    } catch (error) {
      message.error('发送文件路径失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Title level={4}>准备开始</Title>
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 400 }}>
        <div>
          <Text style={{ display: 'block', marginBottom: 16 }}>
            请选择文件路径：
          </Text>
          <Select
            style={{ width: '100%' }}
            placeholder="选择文件路径"
            loading={loadingPaths}
            value={selectedPath}
            onChange={setSelectedPath}
          >
            {filePaths.map(path => (
              <Option key={path} value={path}>
                {path}
              </Option>
            ))}
          </Select>
        </div>
        <Button 
          type="primary" 
          icon={<PlayCircleOutlined />} 
          size="large"
          loading={loading}
          disabled={!selectedPath}
          onClick={handleStart}
        >
          开始
        </Button>
      </Space>
    </div>
  );
};

export default IdleStep; 