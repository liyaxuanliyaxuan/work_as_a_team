import React, { useEffect } from 'react';
import { Layout, Menu, Avatar, Typography, Spin, Tag, Steps } from 'antd';
import { 
  DatabaseOutlined, 
  FilterOutlined,
  PlayCircleOutlined,  // 开始
  FormOutlined,        // 出题
  SolutionOutlined,    // 解答
  CheckCircleOutlined, // 打分
  ToolOutlined,        // 微调
  LineChartOutlined    // 测评
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useWork } from '../contexts/WorkContext';
import { WorkStatus } from '../types/work';
import IdleStep from '../components/workSteps/IdleStep';
import GeneratingStep from '../components/workSteps/GeneratingStep';
import AnsweringStep from '../components/workSteps/AnsweringStep';
import GradingStep from '../components/workSteps/GradingStep';
import TuningStep from '../components/workSteps/TuningStep';
import EvaluatingStep from '../components/workSteps/EvaluatingStep';

const { Content, Sider, Header } = Layout;
const { Text, Title } = Typography;

// 状态对应的颜色映射
const statusColorMap = {
  idle: 'default',
  generating: 'processing',
  answering: 'processing',
  grading: 'warning',
  tuning: 'warning',
  evaluating: 'success'
} as const;

// 步骤配置
const workSteps = [
  {
    title: '开始',
    icon: <PlayCircleOutlined />,
    status: 'idle' as WorkStatus
  },
  {
    title: '出题中',
    icon: <FormOutlined />,
    status: 'generating' as WorkStatus
  },
  {
    title: '解答中',
    icon: <SolutionOutlined />,
    status: 'answering' as WorkStatus
  },
  {
    title: '打分中',
    icon: <CheckCircleOutlined />,
    status: 'grading' as WorkStatus
  },
  {
    title: '微调中',
    icon: <ToolOutlined />,
    status: 'tuning' as WorkStatus
  },
  {
    title: '测评中',
    icon: <LineChartOutlined />,
    status: 'evaluating' as WorkStatus
  }
];

const Home: React.FC = () => {
 // 根据状态返回对应的组件
 const renderStepComponent = () => {
    if (statusLoading) {
      return <Spin size="large" />;
    }

    switch (status) {
      case 'idle':
        return <IdleStep />;
      case 'generating':
        return <GeneratingStep />;
      case 'answering':
        return <AnsweringStep />;
      case 'grading':
        return <GradingStep />;
      case 'tuning':
        return <TuningStep />;
      case 'evaluating':
        return <EvaluatingStep />;
      default:
        return null;
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: userLoading } = useUser();
  const { status, statusName, loading: statusLoading, refreshStatus } = useWork();

  const avatarText = user?.username.slice(-2) || '用户';

  // 获取当前步骤的索引
  const getCurrentStepIndex = () => {
    if (!status) return 0;
    return workSteps.findIndex(step => step.status === status);
  };

  // 设置状态轮询
  useEffect(() => {
    refreshStatus();
    const intervalId = setInterval(() => {
      refreshStatus();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [refreshStatus]);

  const menuItems = [
    {
      key: 'corpus-workshop',
      icon: <DatabaseOutlined />,
      label: '语料工坊',
    },
    {
      key: 'corpus-filter',
      icon: <FilterOutlined />,
      label: '语料筛选',
    },
  ];

  if (userLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['corpus-workshop']}
          items={menuItems}
          style={{ flex: 1 }}
        />
      </Sider>

      <Layout style={{ marginLeft: 200, width: '86vw' }}>
        <Header 
          style={{ 
            padding: '0 24px', 
            background: '#fff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text>{user?.username}</Text>
            <Avatar
              style={{
                backgroundColor: '#1677ff',
                cursor: 'pointer',
              }}
            >
              {avatarText}
            </Avatar>
          </div>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={4} style={{ marginBottom: 16 }}>语料工坊</Title>
            
            {/* 状态标签 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 24 }}>
              <Text>当前状态：</Text>
              {statusLoading ? (
                <Spin size="small" />
              ) : (
                <Tag color={status ? statusColorMap[status] : 'default'}>
                  {statusName || '未知状态'}
                </Tag>
              )}
            </div>

            {/* 步骤条 */}
            <div style={{ padding: '0 24px' }}>
              <Steps
                current={getCurrentStepIndex()}
                items={workSteps.map(step => ({
                  title: step.title,
                  icon: step.icon,
                }))}
                style={{ marginBottom: 24 }}
              />
            </div>
          </div>
          {/* 渲染当前状态对应的组件 */}
          <div style={{ marginTop: 24 }}>
              {renderStepComponent()}
            </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home; 