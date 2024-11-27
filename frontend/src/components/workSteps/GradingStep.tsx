import React, { useEffect, useState } from 'react';
import { Spin, Typography, Card, Space, Progress } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useWork } from '../../contexts/WorkContext';
import { getCurrentScore, type ScoreData } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const GradingStep: React.FC = () => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const { status } = useWork();

  useEffect(() => {
    const fetchCurrentScore = async () => {
      try {
        const data = await getCurrentScore();
        setScoreData(data);
      } catch (error) {
        console.error('Failed to fetch scores:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'grading') {
      fetchCurrentScore();
      const intervalId = setInterval(fetchCurrentScore, 1000);
      return () => clearInterval(intervalId);
    }
  }, [status]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin indicator={<CheckCircleOutlined style={{ fontSize: 24 }} spin />} />
        <Title level={4} style={{ marginTop: 16 }}>正在评分...</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Spin indicator={<CheckCircleOutlined style={{ fontSize: 24 }} spin />} />
        <Title level={4} style={{ marginTop: 16 }}>正在评分</Title>
      </div>

      {scoreData && (
        <Card>
          {/* 问题部分 */}
          <div style={{ 
            padding: '16px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <Title level={5}>问题：</Title>
            <Paragraph strong>{scoreData.question}</Paragraph>
          </div>

          {/* 答案和评分部分 */}
          <Space direction="vertical" style={{ width: '100%' }}>
            {[1, 2, 3, 4].map((num) => {
              const answer = scoreData[`answer${num}` as keyof ScoreData];
              const score = parseFloat(scoreData[`score${num}` as keyof ScoreData] as string);
              
              return (
                <Card
                  key={num}
                  size="small"
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>答案 {num}</span>
                      <div style={{ 
                        backgroundColor: '#f6ffed', 
                        border: '1px solid #b7eb8f',
                        padding: '4px 8px',
                        borderRadius: '4px'
                      }}>
                        <Text type="success" strong>评分：{score}</Text>
                      </div>
                    </div>
                  }
                  style={{ 
                    backgroundColor: '#fff',
                    borderLeft: '4px solid #1890ff'
                  }}
                >
                  <Paragraph>{answer}</Paragraph>
                  <Progress 
                    percent={score} 
                    status="active" 
                    strokeColor={{
                      '0%': '#108ee9',
                      '100%': '#87d068',
                    }}
                  />
                </Card>
              );
            })}
          </Space>
        </Card>
      )}
    </div>
  );
};

export default GradingStep; 