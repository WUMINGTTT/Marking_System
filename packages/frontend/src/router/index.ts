import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/display/:eventId',
      name: 'display',
      component: () => import('@/views/Display.vue'),
    },
    {
      path: '/admin/:eventId',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
    },
    {
      path: '/judge/:eventId',
      name: 'judge',
      component: () => import('@/views/Judge.vue'),
    },
    // 其余全部重定向到登录页
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
});

router.beforeEach(async (to, _from) => {
  const token = localStorage.getItem('token');
  const userStore = useUserStore();

  // 检查是否 token 存在且用户信息不存在，是则获取用户信息
  if (token && !userStore.userInfo) {
    await userStore.getMy();
  }

  // 访问登录页
  if (to.path === '/login') {
    // 已登录则跳去首页
    if (token) return { name: 'home' };
    // 未登录放行
    return true;
  }

  // 没有 token，重定向到登录页
  if (!token) return '/login';

  // 放行
  return true;
});

export default router;
