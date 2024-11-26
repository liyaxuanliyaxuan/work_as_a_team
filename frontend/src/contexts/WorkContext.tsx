import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { WorkStatus, WorkStatusResponse } from '../types/work';
import { getWorkStatus } from '../services/api';

interface WorkContextType {
  status: WorkStatus | null;
  statusName: string;
  loading: boolean;
  refreshStatus: () => Promise<void>;
}

const WorkContext = createContext<WorkContextType | undefined>(undefined);

export const WorkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<WorkStatus | null>(null);
  const [statusName, setStatusName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const refreshStatus = async () => {
    try {
      const response = await getWorkStatus();
      setStatus(response.status);
      setStatusName(response.status_name);
    } catch (error) {
      message.error('获取工作状态失败');
    }
  };

  useEffect(() => {
    refreshStatus().finally(() => setLoading(false));
  }, []);

  return (
    <WorkContext.Provider value={{ status, statusName, loading, refreshStatus }}>
      {children}
    </WorkContext.Provider>
  );
};

export const useWork = () => {
  const context = useContext(WorkContext);
  if (context === undefined) {
    throw new Error('useWork must be used within a WorkProvider');
  }
  return context;
}; 