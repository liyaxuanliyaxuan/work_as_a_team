import React from 'react';
import { Spin, Typography } from 'antd';
import { FormOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GeneratingStep: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin indicator={<FormOutlined style={{ fontSize: 24 }} spin />} />
      <Title level={4} style={{ marginTop: 16 }}>正在生成题目</Title>
      <Text type="secondary">请稍候...</Text>
    </div>
  );
};

export default GeneratingStep;