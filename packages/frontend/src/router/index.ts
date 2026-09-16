import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../views/Home.vue') },
    { path: '/login', component: () => import('../views/Login.vue') },
    { path: '/display', component: () => import('../views/Display.vue') },
    { path: '/admin', component: () => import('../views/Admin.vue') },
    { path: '/judge', component: () => import('../views/Judge.vue') },
  ],
});

export default router;
