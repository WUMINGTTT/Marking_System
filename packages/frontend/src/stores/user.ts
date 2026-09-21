import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserInfo } from 'shared';
import { getUserInfo } from '@/api/user';

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '');
  const userInfo = ref<UserInfo | null>(null);

  // 登录成功后保存 token
  function setToken(t: string) {
    token.value = t;
    localStorage.setItem('token', t);
  }

  // 获取当前用户信息
  async function getMy() {
    const res = await getUserInfo();
    userInfo.value = res.data;
  }

  // 退出登录，清空信息
  function logout() {
    userInfo.value = null;
    token.value = '';
    localStorage.removeItem('token');
  }

  return { userInfo, token, setToken, getMy, logout };
});
