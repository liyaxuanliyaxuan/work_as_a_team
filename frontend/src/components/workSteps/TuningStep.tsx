import React, { useEffect, useState } from 'react';
import { Spin, Typography, Progress, Card } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import { useWork } from '../../contexts/WorkContext';
import { getTuningProgress, type TuningProgress } from '../../services/api';

const { Title, Text } = Typography;

const TuningStep: React.FC = () => {
  const [progressData, setProgressData] = useState<TuningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { status } = useWork();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await getTuningProgress();
        setProgressData(data);
      } catch (error) {
        console.error('Failed to fetch tuning progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'tuning') {
      fetchProgress();
      const intervalId = setInterval(fetchProgress, 1000);
      return () => clearInterval(intervalId);
    }
  }, [status]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin indicator={<ToolOutlined style={{ fontSize: 24 }} spin />} />
        <Title level={4} style={{ marginTop: 16 }}>正在初始化模型微调...</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <ToolOutlined style={{ fontSize: 32, color: '#1890ff' }} />
          <Title level={4} style={{ margin: '16px 0' }}>模型微调中</Title>
          
          {progressData && (
            <>
              <Progress
                type="circle"
                percent={progressData.progress}
                status={progressData.progress >= 100 ? 'success' : 'active'}
                style={{ marginBottom: '24px' }}
              />
              
              <div style={{ marginTop: '24px' }}>
                <Progress
                  percent={progressData.progress}
                  status={progressData.progress >= 100 ? 'success' : 'active'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
              
              <Text type="secondary" style={{ 
                display: 'block',
                marginTop: '16px',
                fontSize: '16px'
              }}>
                {progressData.message}
              </Text>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TuningStep; 