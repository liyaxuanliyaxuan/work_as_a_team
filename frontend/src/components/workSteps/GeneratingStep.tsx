import React, { useEffect, useState } from 'react';
import { Spin, Typography, Card, List } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { getCurrentQAPairs } from '../../services/api';
import { useWork } from '../../contexts/WorkContext';
import type { QAPair } from '../../services/api';

const { Title, Text, Paragraph } = Typography;

const GeneratingStep: React.FC = () => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const { status } = useWork();  // 获取当前状态

  useEffect(() => {
    const fetchQAPairs = async () => {
      try {
        const pairs = await getCurrentQAPairs();
        setQaPairs(pairs);
      } catch (error) {
        console.error('Failed to fetch QA pairs:', error);
      } finally {
        setLoading(false);
      }
    };

    // 只在状态为 generating 时进行轮询
    if (status === 'generating') {
      // 立即获取一次
      fetchQAPairs();

      // 设置定时器，每秒获取一次
      const intervalId = setInterval(fetchQAPairs, 1000);

      // 清理函数
      return () => clearInterval(intervalId);
    }
  }, [status]);  // 依赖项添加 status

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Spin indicator={<FormOutlined style={{ fontSize: 24 }} spin />} />
        <Title level={4} style={{ marginTop: 16 }}>正在生成题目</Title>
        <Text type="secondary">已生成 {qaPairs.length} 个问答对</Text>
      </div>

      <List
        loading={loading}
        dataSource={qaPairs}
        renderItem={(item, index) => (
          <Card 
            style={{ marginBottom: 16 }} 
            title={`问题 ${index + 1}`}
          >
            <Paragraph strong>{item.question}</Paragraph>
            <Paragraph type="secondary">{item.answer}</Paragraph>
          </Card>
        )}
      />
    </div>
  );
};

export default GeneratingStep;