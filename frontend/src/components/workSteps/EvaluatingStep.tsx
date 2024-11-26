import React from 'react';
import { Spin, Typography } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const EvaluatingStep: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin indicator={<LineChartOutlined style={{ fontSize: 24 }} spin />} />
      <Title level={4} style={{ marginTop: 16 }}>测评进行中</Title>
      <Text type="secondary">正在评估优化效果...</Text>
    </div>
  );
};

export default EvaluatingStep; 