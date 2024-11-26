import React from 'react';
import { Button, Typography } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const IdleStep: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <Title level={4}>准备开始</Title>
      <Text style={{ display: 'block', marginBottom: 24 }}>
        点击开始按钮，启动语料工坊
      </Text>
      <Button type="primary" icon={<PlayCircleOutlined />} size="large">
        开始
      </Button>
    </div>
  );
};

export default IdleStep; 