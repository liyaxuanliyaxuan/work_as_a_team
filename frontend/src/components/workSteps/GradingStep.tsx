import React from 'react';
import { Spin, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GradingStep: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin indicator={<CheckCircleOutlined style={{ fontSize: 24 }} spin />} />
      <Title level={4} style={{ marginTop: 16 }}>正在评分</Title>
      <Text type="secondary">正在对答案进行评分...</Text>
    </div>
  );
};

export default GradingStep; 