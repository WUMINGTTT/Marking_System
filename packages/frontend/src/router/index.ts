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
      path: '/display',
      name: 'display',
      component: () => import('@/views/Display.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin.vue'),
    },
    {
      path: '/judge',
      name: 'judge',
      component: () => import('@/views/Judge.vue'),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  // 有 token 但还没拉过用户信息
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getMy();
    } catch {
      // 如果获取用户信息失败，说明 token 无效，清空用户信息
      if (userStore.token) {
        // 拦截器没处理，守卫补一刀
        userStore.logout();
        next('/login');
      } else {
        // 拦截器已经处理并跳转，中止当前导航即可
        next(false);
      }
    }
  }
  // 访问登录页直接放行
  if (to.path === '/login') {
    if (userStore.token) {
      next('/home');
      return;
    } else {
      next();
      return;
    }
  }

  // 检查 token 是否存在，不存在则重定向到登录页
  if (!userStore.token) {
    next('/login');
    return;
  }

  // 放行
  next();
});

export default router;
