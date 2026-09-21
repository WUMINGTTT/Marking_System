import axios from 'axios';

const request = axios.create({
  baseURL: 'http://127.0.0.1:3000',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 防抖：避免并发 401 触发多次跳转
let isRedirecting = false;

// 响应拦截器
request.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.code === 'ECONNABORTED') {
      console.log('请求超时');
    } else if (err.response?.status === 401) {
      console.log('登录已过期');

      if (!isRedirecting) {
        isRedirecting = true;

        const { useUserStore } = await import('@/stores/user');

        const router = (await import('@/router')).default;
        const userStore = useUserStore();
        userStore.logout();

        if (router.currentRoute.value.path !== '/login') {
          await router.replace('/login');
        }

        isRedirecting = false;
      }
    } else {
      console.log(err.response?.data?.message || '请求失败');
    }
    return Promise.reject(err);
  }
);

export default request;
