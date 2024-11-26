import React from 'react';
import { Spin, Typography } from 'antd';
import { SolutionOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const AnsweringStep: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin indicator={<SolutionOutlined style={{ fontSize: 24 }} spin />} />
      <Title level={4} style={{ marginTop: 16 }}>正在解答</Title>
      <Text type="secondary">AI正在处理答案...</Text>
    </div>
  );
};

export default AnsweringStep;