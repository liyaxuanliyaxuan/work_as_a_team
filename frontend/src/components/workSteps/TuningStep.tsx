import React from 'react';
import { Spin, Typography, Progress } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const TuningStep: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Spin indicator={<ToolOutlined style={{ fontSize: 24 }} spin />} />
      <Title level={4} style={{ marginTop: 16 }}>模型微调中</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        正在根据评分结果优化模型...
      </Text>
      <Progress percent={75} status="active" style={{ maxWidth: 400, margin: '0 auto' }} />
    </div>
  );
};

export default TuningStep; 