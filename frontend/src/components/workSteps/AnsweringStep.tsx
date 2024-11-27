import React, { useEffect, useState } from 'react';
import { Spin, Typography, Card, List, Space } from 'antd';
import { SolutionOutlined } from '@ant-design/icons';
import { useWork } from '../../contexts/WorkContext';
import { getCurrentAnswer, type AnswerData } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const AnsweringStep: React.FC = () => {
  const [answerData, setAnswerData] = useState<AnswerData | null>(null);
  const [loading, setLoading] = useState(true);
  const { status } = useWork();

  useEffect(() => {
    const fetchCurrentAnswer = async () => {
      try {
        const data = await getCurrentAnswer();
        setAnswerData(data);
      } catch (error) {
        console.error('Failed to fetch answer:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'answering') {
      // 立即获取一次
      fetchCurrentAnswer();

      // 设置定时器，每秒获取一次
      const intervalId = setInterval(fetchCurrentAnswer, 1000);

      // 清理函数
      return () => clearInterval(intervalId);
    }
  }, [status]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin indicator={<SolutionOutlined style={{ fontSize: 24 }} spin />} />
        <Title level={4} style={{ marginTop: 16 }}>正在生成答案...</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Spin indicator={<SolutionOutlined style={{ fontSize: 24 }} spin />} />
        <Title level={4} style={{ marginTop: 16 }}>正在生成答案</Title>
      </div>

      {answerData && (
        <Card>
          {/* 问题部分 */}
          <div style={{ 
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <Title level={5}>问题：</Title>
            <Paragraph strong>{answerData.question}</Paragraph>
          </div>

          {/* 答案部分 */}
          <Space direction="vertical" style={{ width: '100%' }}>
            {[1, 2, 3, 4].map((num) => (
              <Card
                key={num}
                size="small"
                title={`答案 ${num}`}
                style={{ 
                  backgroundColor: '#fff',
                  borderLeft: '4px solid #1890ff'
                }}
              >
                <Paragraph>{answerData[`answer${num}`]}</Paragraph>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default AnsweringStep;