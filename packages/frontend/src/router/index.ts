import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/display',
      name: 'display',
      component: () => import('../views/Display.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
    },
    {
      path: '/judge',
      name: 'judge',
      component: () => import('../views/Judge.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  // 访问登录页直接放行
  if (to.path === '/login') {
    if (token) {
      next('/home');
      return;
    } else {
      next();
    }
  }

  // 检查 token 是否存在，不存在则重定向到登录页
  if (!token) {
    next('/login');
    return;
  }

  // 放行
  next();
});

export default router;
