// 初始化axios
import axios from 'axios';
import router from '@/router';

// 配置axios
const request = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 在请求中携带 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
request.interceptors.response.use(
  (res) => res.data, // 直接返回业务数据
  (err) => {
    if (err.code === 'ECONNABORTED') {
      console.log('请求超时');
    } else if (err.response?.status === 401) {
      console.log('登录已过期');
      // 清除 token
      localStorage.removeItem('token');
      // 跳登录页
      router.push('/login');
    } else {
      console.log(err.response?.data?.message || '请求失败');
    }
    return Promise.reject(err);
  }
);

export default request;
