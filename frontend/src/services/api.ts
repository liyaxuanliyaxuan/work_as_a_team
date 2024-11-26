import axios, { AxiosError } from 'axios';
import { message } from 'antd';
import {User} from '../types/user'
import { WorkStatusResponse } from '../types/work';


//Access-Control-Allow-Origin 指向前端 ip:port
// axios.defaults.headers.common['Access-Control-Allow-Origin'] = true


const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 添加响应拦截器统一处理错误
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
    }
    throw error;
  }
);

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.detail || '登录失败，请检查用户名和密码');
    }
    throw error;
  }
};

export const register = async (username: string, password: string, inviteCode?: string) => {
  try {
    const response = await api.post('/auth/register', { username, password, inviteCode });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.detail || '注册失败，请稍后重试');
    }
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/check');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.detail || '验证失败');
    }
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.detail || '获取用户信息失败');
      }
      throw error;
    }
  };

export const getWorkStatus = async (): Promise<WorkStatusResponse> => {
  try {
    const response = await api.get<WorkStatusResponse>('/work/status');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.detail || '获取工作状态失败');
    }
    throw error;
  }
};